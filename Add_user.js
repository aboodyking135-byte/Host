import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { username, password, isAdmin } = req.body;

    // التحقق من أن المستخدم الحالي هو الأدمن
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const usersPath = path.join(process.cwd(), 'users.json');
    let users = [];

    if (fs.existsSync(usersPath)) {
      const fileContent = fs.readFileSync(usersPath, 'utf8');
      users = JSON.parse(fileContent);
    }

    // التحقق من عدم تكرار اسم المستخدم
    if (users.some(u => u.username === username)) {
      return res.status(400).json({ 
        success: false, 
        message: 'اسم المستخدم موجود بالفعل' 
      });
    }

    // إضافة المستخدم الجديد
    const newUser = {
      id: users.length + 1,
      username,
      password,
      isAdmin: isAdmin || false,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      device: null,
      filesCount: 0
    };

    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    return res.status(201).json({
      success: true,
      message: 'تم إضافة المستخدم بنجاح',
      user: {
        id: newUser.id,
        username: newUser.username,
        isAdmin: newUser.isAdmin,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Add user error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
}
