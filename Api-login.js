import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // السماح بالطلبات من أي مصدر (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { username, password, device } = req.body;

    // قراءة ملف users.json
    const usersPath = path.join(process.cwd(), 'users.json');
    let users = [];
    
    if (fs.existsSync(usersPath)) {
      const fileContent = fs.readFileSync(usersPath, 'utf8');
      users = JSON.parse(fileContent);
    } else {
      // إنشاء ملف users.json إذا لم يكن موجوداً مع المستخدم الافتراضي
      users = [
        {
          id: 1,
          username: 'DragonMaster',
          password: 'Dragon@Host2026',
          isAdmin: true,
          createdAt: new Date().toISOString(),
          lastLogin: null,
          device: 'computer'
        }
      ];
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    }

    // البحث عن المستخدم
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
      });
    }

    // تحديث آخر تسجيل دخول
    user.lastLogin = new Date().toISOString();
    user.device = device;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    // إنشاء توكن بسيط (في الإنتاج استخدم JWT)
    const token = Buffer.from(`${user.id}-${Date.now()}`).toString('base64');

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token: token,
      username: user.username,
      isAdmin: user.isAdmin,
      userId: user.id
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
      }
