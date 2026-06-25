import dotenv from 'dotenv';
import path from 'path';
import http from 'http';

dotenv.config({ path: path.join(__dirname, '../../.env') });

function getJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const host = 'http://localhost:5000/api';
  try {
    console.log('Querying all products:');
    const all = await getJSON(`${host}/products`);
    console.log(`  Count: ${all.products?.length || 0}`);
    console.log(`  Names: ${all.products?.map((p: any) => p.name).join(', ')}`);

    console.log('\nQuerying prescription category products:');
    const prescription = await getJSON(`${host}/products?category=prescription`);
    console.log(`  Count: ${prescription.products?.length || 0}`);
    console.log(`  Names: ${prescription.products?.map((p: any) => p.name).join(', ')}`);

    console.log('\nQuerying prescription category and gender=men:');
    const menPrescription = await getJSON(`${host}/products?category=prescription&gender=men`);
    console.log(`  Count: ${menPrescription.products?.length || 0}`);
    console.log(`  Names: ${menPrescription.products?.map((p: any) => p.name).join(', ')}`);
  } catch (err) {
    console.error('API Test Error:', err);
  }
}

run();
