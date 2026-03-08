import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // التحقق من التوكن (بسيط)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const usersPath = path.join(process.cwd(), 'users.json');
    
    if (!fs.existsSync(usersPath)) {
      return res.status(200).json({ 
        success: true, 
        users: [
          {
            id: 1,
            username: 'DragonMaster',
            isAdmin: true,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            device: 'computer',
            filesCount: 0
          }
        ] 
      });
    }

    const fileContent = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(fileContent);

    // إزالة كلمات المرور من النتائج
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      device: user.device,
      filesCount: user.filesCount || 0
    }));

    return res.status(200).json({
      success: true,
      users: safeUsers,
      total: safeUsers.length
    });

  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
}
