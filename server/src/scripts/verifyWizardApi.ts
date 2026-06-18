import 'dotenv/config';
import { signJWT } from '../lib/auth';

const ADMIN_USER_ID = '6a30f027dc02afc2e5588f6f'; // Mock admin user ID for JWT

async function run() {
  console.log('--- WIZARD API VERIFICATION START ---');
  
  // 1. Generate Admin Token
  console.log('1. Generating Admin Token...');
  const token = signJWT({ userId: ADMIN_USER_ID, role: 'admin' });
  console.log('   Token:', token ? 'SUCCESS' : 'FAILED');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // 2. Fetch Metadata
  console.log('2. Fetching Brands, Categories, and Warehouses metadata...');
  try {
    const metaRes = await fetch('http://localhost:5000/api/admin/products/metadata', { headers });
    const metaData = (await metaRes.json()) as any;
    console.log('   Status:', metaRes.status);
    console.log('   Brands count:', metaData.brands?.length);
    console.log('   Categories count:', metaData.categories?.length);
    console.log('   Warehouses count:', metaData.warehouses?.length);
    if (metaRes.status !== 200) throw new Error('Failed to fetch metadata');
  } catch (err: any) {
    console.error('   Error:', err.message);
  }

  // 3. Create Product
  console.log('3. Creating a product with wizard options...');
  const testSku = `EG-TEST-${Date.now().toString().slice(-4)}`;
  const testSlug = `test-rectangular-frame-${Date.now().toString().slice(-4)}`;
  
  const productPayload = {
    sku: testSku,
    name: 'Test Wizard Rectangular Glass',
    slug: testSlug,
    brand: 'Vincent Chase',
    category: 'prescription',
    gender: 'unisex',
    status: 'Active',
    costPrice: 500,
    mrp: 1499,
    sellingPrice: 1299,
    gstPercent: 18,
    discountType: 'Percentage',
    discountValue: 13,
    taxInclusive: true,
    enableMemberPricing: true,
    memberPrices: {
      regularPrice: 1299,
      goldMemberPrice: 999,
      platinumMemberPrice: 899,
    },
    frameShape: 'Rectangle',
    frameSize: 'Medium',
    material: 'TR90',
    primaryColor: 'Matte Black',
    lensWidth: 52,
    bridgeWidth: 17,
    templeLength: 142,
    compatibleLensTypes: ['Zero Power', 'Single Vision'],
    dynamicLensPricing: [
      { lensName: 'Test Blue Cut Lens', lensCategory: 'Single Vision', regularPrice: 1200, goldPrice: 900, platinumPrice: 800, priority: 1, status: 'Active' }
    ],
    thicknessPricing: [
      { thickness: '1.50', regularPrice: 0, goldPrice: 0, platinumPrice: 0 },
      { thickness: '1.56', regularPrice: 400, goldPrice: 300, platinumPrice: 200 }
    ],
    coatingPricing: [
      { coatingName: 'Anti Glare', regularPrice: 400, memberPrice: 300, isActive: true }
    ],
    oneRupeeFrameOffer: true,
    oneRupeeOfferConditions: {
      membershipRequired: true,
      minCartValue: 1000
    },
    variants: [
      { name: 'Matte Blue variant', color: 'Blue', sku: `${testSku}-BLU`, stock: 15, status: 'Active', images: [], priority: 1 }
    ],
    shippingWeight: 180,
    thumbnail: 'https://images.lenskart.com/thumbnail.jpg',
    seoKeywords: 'test glasses, rectangular, matte black'
  };

  let productId = '';

  try {
    const createRes = await fetch('http://localhost:5000/api/admin/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(productPayload)
    });
    console.log('   Status:', createRes.status);
    const data = (await createRes.json()) as any;
    productId = data._id;
    console.log('   Created Product ID:', productId);
    console.log('   Created SKU:', data.sku);
    console.log('   Created Slug:', data.slug);
    if (createRes.status !== 201) throw new Error('Product creation failed');
  } catch (err: any) {
    console.error('   Error:', err.message);
  }

  // 4. Test SKU uniqueness validation
  console.log('4. Testing SKU uniqueness validation (should fail)...');
  try {
    const duplicatePayload = { ...productPayload, slug: `${testSlug}-dup` };
    const failRes = await fetch('http://localhost:5000/api/admin/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(duplicatePayload)
    });
    console.log('   Status:', failRes.status);
    const failData = (await failRes.json()) as any;
    console.log('   Error response:', failData.error);
    if (failRes.status !== 400) throw new Error('Validation did not fail on duplicate SKU');
  } catch (err: any) {
    console.error('   Error:', err.message);
  }

  // 5. Query Product by ID
  console.log('5. Querying product details, variants, and audit logs by ID...');
  try {
    const getRes = await fetch(`http://localhost:5000/api/admin/products/${productId}`, { headers });
    console.log('   Status:', getRes.status);
    const getResult = (await getRes.json()) as any;
    console.log('   Returned Product Name:', getResult.product?.name);
    console.log('   Variants sync count:', getResult.variants?.length);
    console.log('   Audit Logs count:', getResult.auditLogs?.length);
    console.log('   Audit Log action:', getResult.auditLogs?.[0]?.action);
    if (getRes.status !== 200) throw new Error('Product retrieval failed');
  } catch (err: any) {
    console.error('   Error:', err.message);
  }

  // 6. Update Product details
  console.log('6. Updating product details (should increment version and add audit log)...');
  try {
    const updatePayload = {
      name: 'Test Wizard Rectangular Glass - Updated Name',
      sellingPrice: 1199,
      variants: [
        { name: 'Matte Blue variant', color: 'Blue', sku: `${testSku}-BLU`, stock: 20, status: 'Active', images: [], priority: 1 },
        { name: 'Matte Red variant', color: 'Red', sku: `${testSku}-RED`, stock: 10, status: 'Active', images: [], priority: 2 }
      ]
    };
    const updateRes = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatePayload)
    });
    console.log('   Status:', updateRes.status);
    const updateResult = (await updateRes.json()) as any;
    console.log('   Updated version:', updateResult.product?.currentVersion);
    
    // Query again to check updated variants and audit logs
    const detailRes = await fetch(`http://localhost:5000/api/admin/products/${productId}`, { headers });
    const detailResult = (await detailRes.json()) as any;
    console.log('   New Variants sync count:', detailResult.variants?.length);
    console.log('   New Audit Logs count:', detailResult.auditLogs?.length);
    console.log('   New Audit Log actions:', detailResult.auditLogs?.map((l: any) => l.action));
  } catch (err: any) {
    console.error('   Error:', err.message);
  }

  console.log('--- WIZARD API VERIFICATION COMPLETE ---');
}

run().catch(console.error);
