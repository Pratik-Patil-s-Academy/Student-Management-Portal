const corsOptions = {
  origin: [
    'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 
    'http://localhost:5176', 'http://localhost:5500', 'https://ppacademy.vercel.app', 
    'https://temp-smp.vercel.app', 'https://pratikpatilsacademy.vercel.app',
    'https://student-management-portal1.vercel.app', 'https://smp-liart.vercel.app',
    'https://student-management-portal-green.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

export default corsOptions;
