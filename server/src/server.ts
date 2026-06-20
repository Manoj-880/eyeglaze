import 'dotenv/config';
import http from 'http';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

import { connectDB } from './config/mongodb';
import { startInMemoryMongoDB } from './config/inMemoryMongo';
import { seedDatabase } from './lib/seedDatabase';
import { initSocket } from './lib/socket';
import app from './app';

const PORT = process.env.PORT || 5000;

function setupAndroidPortForwarding() {
  let adbPath = 'adb'; // Default if adb is in PATH
  
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      const winAdb = path.join(localAppData, 'Android', 'Sdk', 'platform-tools', 'adb.exe');
      if (fs.existsSync(winAdb)) {
        adbPath = `"${winAdb}"`;
      }
    }
  } else if (process.platform === 'darwin') {
    const homeDir = process.env.HOME;
    if (homeDir) {
      const macAdb = path.join(homeDir, 'Library', 'Android', 'sdk', 'platform-tools', 'adb');
      if (fs.existsSync(macAdb)) {
        adbPath = `"${macAdb}"`;
      }
    }
  }

  exec(`${adbPath} reverse tcp:5000 tcp:5000`, (err, stdout, stderr) => {
    if (err) {
      console.log('[Android Port Forwarding] Note: adb reverse was not set up (no active Android device/emulator detected or adb not found)');
    } else {
      console.log('[Android Port Forwarding] Successfully ran adb reverse tcp:5000 tcp:5000. Connected Android devices can now access the backend at http://127.0.0.1:5000');
    }
  });
}


async function main() {
  try {
    console.log('--- Server Startup Debug ---');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_URI present?:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI value:', process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'development') {
      const inMemoryUri = await startInMemoryMongoDB();
      process.env.MONGODB_URI = inMemoryUri;
    }
    
    await connectDB();
    await seedDatabase();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`EyeGlaze Express server listening on port ${PORT}`);
      setupAndroidPortForwarding();
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

main();
