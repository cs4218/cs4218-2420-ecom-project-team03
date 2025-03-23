const LAPTOP_PRODUCT = {
  _id: "66db427fdb0119d9234b27f3",
  name: "Laptop",
  slug: "laptop",
  description: "A powerful laptop",
  price: 1499.99, 
  category: "66db427fdb0119d9234b27ed", 
  quantity: 30,
  shipping: true,
};

const SMARTPHONE_PRODUCT = {
  _id: "66db427fdb0119d9234b27f5",
  name: "Smartphone",
  slug: "smartphone",
  description: "A high-end smartphone",
  price: 99.99, 
  category: "66db427fdb0119d9234b27ed", 
  quantity: 500,
  shipping: false,
};

const BOOK_PRODUCT = {
  _id: "66db427fdb0119d9234b27f1",
  name: "Book",
  slug: "book",
  description: "A thick book",
  price: 10, 
  category: "66db427fdb0119d9234b27ef", 
  quantity: 1,
  shipping: false,
};

const ADMIN_USER = {
  _id: "67ab6a3bd0360ad8b53a1eeb",
  address: "123 Street",
  answer: "password123",
  email: "test@example.com",
  name: "John Doe",
  password: "$2b$10$Gm/jh/WplbLtkzJoYKAwHegUJU3N2WEUv9cc5qVHoT4SPyp9VSGvi", // password123
  phone: "1234567890",
  role: 1
};

const NORMAL_USER = {
  _id: "67136d5416c8949aec627dd3", 
  "name": "Test 3",
  "email": "hello@test.com",
  "password": "$2b$10$asldvEFcFkNXlFpY.u8FZOq7gKegGCbVnCNACJr7ndC4bOjdImVWi",
  "phone": "123",
  "address": "hell3@test.com",
  "answer": "hello@test.com",
  "role": 0,
}

const ELECTRONIC_CATEGORY = {
  _id: LAPTOP_PRODUCT.category,
  name: "Electronic",
  slug: "electronic"
};

const BOOK_CATEGORY = {
  _id: BOOK_PRODUCT.category,
  name: "Book",
  slug: "book"
};

export const DUMMY_PRODUCTS = [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT];
export const DUMMY_CATEGORIES = [ELECTRONIC_CATEGORY, BOOK_CATEGORY];
export const DUMMY_USERS = [ADMIN_USER, NORMAL_USER];