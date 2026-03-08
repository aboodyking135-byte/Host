import fs from 'fs';
import path from 'path';
import os from 'os';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const usersPath = path.join(process.cwd(), 'users.json');
    const filesPath = path.join(process.cwd(), 'files.json');

    // قراءة عدد المستخدمين
    let usersCount = 0;
    if (fs.existsSync(usersPath)) {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      usersCount = users.length;
    }

    // قراءة عدد الملفات
    let filesCount = 0;
    if (fs.existsSync(filesPath)) {
      const files = JSON.parse(fs.readFileSync(filesPath, 'utf8'));
      filesCount = files.length;
    }

    // إحصائيات النظام
    const stats = {
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      cpuCount: os.cpus().length,
      loadAvg: os.loadavg(),
      users: {
        total: usersCount,
        active: usersCount, // في الإنتاج نحتاج منطق لتحديد النشط
        admins: 1
      },
      files: {
        total: filesCount,
        scanned: filesCount,
        blocked: 0 // في الإنتاج نحتاج منطق للتهديدات
      },
      containers: {
        total: 5,
        running: 4,
        stopped: 1
      }
    };

    return res.status(200).json(stats);

  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
        }
