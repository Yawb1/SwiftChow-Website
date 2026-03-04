/* ============================================
   SWIFT CHOW - Data File
   All food items, blog posts, reviews, and business data
   ============================================ */

// ============================================
// FOOD ITEMS DATA (44 items)
// ============================================
const foodItems = [
  // BURGERS (8 items)
  {
    id: 1,
    name: "Classic Beef Burger",
    description: "Juicy 100% Ghanaian beef patty with fresh lettuce, tomatoes, onions, pickles, and our signature SWIFT sauce on a toasted sesame bun.",
    price: 45,
    category: "burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 234,
    isPopular: true,
    isNew: false,
    calories: 650,
    prepTime: "10-15 min"
  },
  {
    id: 2,
    name: "Cheese Burger Deluxe",
    description: "Double beef patty stacked with melted cheddar cheese, crispy bacon, caramelized onions, and special burger sauce.",
    price: 55,
    category: "burgers",
    image: "https://plus.unsplash.com/premium_photo-1668025335051-98c22e32cbba?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.9,
    reviews: 456,
    isPopular: true,
    isNew: false,
    calories: 850,
    prepTime: "12-18 min"
  },
  {
    id: 3,
    name: "Chicken Burger",
    description: "Crispy fried chicken breast with coleslaw, pickles, and tangy mayo on a buttery brioche bun.",
    price: 50,
    category: "burgers",
    image: "https://images.unsplash.com/photo-1637710847214-f91d99669e18?q=80&w=721&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.7,
    reviews: 189,
    isPopular: true,
    isNew: false,
    calories: 720,
    prepTime: "10-15 min"
  },
  {
    id: 4,
    name: "Double Stack Burger",
    description: "Two premium beef patties, double cheese, lettuce, tomato, onion, and SWIFT's legendary stacker sauce.",
    price: 75,
    category: "burgers",
    image: "https://images.unsplash.com/photo-1544037803-ed377ec9a75e?q=80&w=1012&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.9,
    reviews: 312,
    isPopular: true,
    isNew: false,
    calories: 1100,
    prepTime: "15-20 min"
  },
  {
    id: 5,
    name: "BBQ Bacon Burger",
    description: "Smoky BBQ glazed beef patty topped with crispy bacon, onion rings, cheddar, and hickory BBQ sauce.",
    price: 65,
    category: "burgers",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 278,
    isPopular: false,
    isNew: false,
    calories: 920,
    prepTime: "12-18 min"
  },
  {
    id: 6,
    name: "Veggie Burger",
    description: "Homemade plant-based patty with avocado, sprouts, tomato, lettuce, and herb aioli on whole wheat bun.",
    price: 40,
    category: "burgers",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 145,
    isPopular: false,
    isNew: true,
    calories: 480,
    prepTime: "10-15 min"
  },
  {
    id: 7,
    name: "Spicy Jerk Burger",
    description: "Caribbean-inspired jerk seasoned beef with pineapple salsa, jalapeños, and spicy scotch bonnet mayo.",
    price: 60,
    category: "burgers",
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 198,
    isPopular: false,
    isNew: true,
    calories: 780,
    prepTime: "12-18 min"
  },
  {
    id: 8,
    name: "Mushroom Swiss Burger",
    description: "Beef patty topped with sautéed mushrooms, melted Swiss cheese, caramelized onions, and truffle aioli.",
    price: 58,
    category: "burgers",
    image: "https://images.unsplash.com/photo-1608767221051-2b9d18f35a2f?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 167,
    isPopular: false,
    isNew: false,
    calories: 820,
    prepTime: "12-18 min"
  },

  // PIZZA (7 items)
  {
    id: 9,
    name: "Margherita Pizza",
    description: "Classic Italian pizza with San Marzano tomato sauce, fresh mozzarella, basil leaves, and extra virgin olive oil.",
    price: 80,
    category: "pizza",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 234,
    isPopular: true,
    isNew: false,
    calories: 1200,
    prepTime: "20-25 min"
  },
  {
    id: 10,
    name: "Pepperoni Pizza",
    description: "Loaded with premium pepperoni slices, mozzarella cheese, and zesty marinara sauce on hand-tossed crust.",
    price: 95,
    category: "pizza",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 456,
    isPopular: true,
    isNew: false,
    calories: 1450,
    prepTime: "20-25 min"
  },
  {
    id: 11,
    name: "BBQ Chicken Pizza",
    description: "Smoky BBQ sauce base, grilled chicken, red onions, cilantro, and a blend of mozzarella and gouda cheese.",
    price: 100,
    category: "pizza",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 312,
    isPopular: true,
    isNew: false,
    calories: 1380,
    prepTime: "20-25 min"
  },
  {
    id: 12,
    name: "Veggie Supreme Pizza",
    description: "Colorful medley of bell peppers, mushrooms, olives, onions, tomatoes, and artichokes on marinara base.",
    price: 85,
    category: "pizza",
    image: "https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 178,
    isPopular: false,
    isNew: false,
    calories: 1100,
    prepTime: "20-25 min"
  },
  {
    id: 13,
    name: "Meat Lovers Pizza",
    description: "For the carnivores - pepperoni, Italian sausage, bacon, ham, and ground beef with extra cheese.",
    price: 110,
    category: "pizza",
    image: "https://plus.unsplash.com/premium_photo-1664472696633-4b0b41e95202?q=80&w=1076&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.9,
    reviews: 389,
    isPopular: true,
    isNew: false,
    calories: 1650,
    prepTime: "22-28 min"
  },
  {
    id: 14,
    name: "Hawaiian Pizza",
    description: "Sweet and savory combination of ham, pineapple chunks, bacon bits, and mozzarella cheese.",
    price: 90,
    category: "pizza",
    image: "https://plus.unsplash.com/premium_photo-1672498268734-0f41e888298d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.4,
    reviews: 156,
    isPopular: false,
    isNew: false,
    calories: 1280,
    prepTime: "20-25 min"
  },
  {
    id: 15,
    name: "Four Cheese Pizza",
    description: "Rich blend of mozzarella, parmesan, gorgonzola, and fontina cheeses with garlic butter crust.",
    price: 95,
    category: "pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 234,
    isPopular: false,
    isNew: true,
    calories: 1400,
    prepTime: "20-25 min"
  },

  // SANDWICHES (5 items)
  {
    id: 16,
    name: "Club Sandwich",
    description: "Triple-decker with roasted turkey, crispy bacon, lettuce, tomato, and mayo on toasted bread.",
    price: 40,
    category: "sandwiches",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 189,
    isPopular: true,
    isNew: false,
    calories: 580,
    prepTime: "8-12 min"
  },
  {
    id: 17,
    name: "Grilled Chicken Sandwich",
    description: "Marinated grilled chicken breast with avocado, Swiss cheese, lettuce, and honey mustard.",
    price: 45,
    category: "sandwiches",
    image: "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 234,
    isPopular: true,
    isNew: false,
    calories: 520,
    prepTime: "10-15 min"
  },
  {
    id: 18,
    name: "Tuna Melt",
    description: "Creamy tuna salad with melted cheddar cheese, tomatoes, and pickles on grilled sourdough.",
    price: 42,
    category: "sandwiches",
    image: "https://images.unsplash.com/photo-1485451456034-3f9391c6f769?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 145,
    isPopular: false,
    isNew: false,
    calories: 490,
    prepTime: "8-12 min"
  },
  {
    id: 19,
    name: "BLT Sandwich",
    description: "Classic bacon, lettuce, and tomato sandwich with garlic aioli on toasted ciabatta bread.",
    price: 38,
    category: "sandwiches",
    image: "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400&h=300&fit=crop",
    rating: 4.4,
    reviews: 123,
    isPopular: false,
    isNew: false,
    calories: 450,
    prepTime: "6-10 min"
  },
  {
    id: 20,
    name: "Veggie Wrap",
    description: "Grilled vegetables, hummus, feta cheese, mixed greens, and balsamic glaze in a spinach tortilla.",
    price: 35,
    category: "sandwiches",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop",
    rating: 4.3,
    reviews: 98,
    isPopular: false,
    isNew: true,
    calories: 380,
    prepTime: "8-12 min"
  },

  // SHAKES (5 items)
  {
    id: 21,
    name: "Chocolate Shake",
    description: "Rich and creamy chocolate milkshake made with premium cocoa and vanilla ice cream, topped with whipped cream.",
    price: 30,
    category: "shakes",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 345,
    isPopular: true,
    isNew: false,
    calories: 580,
    prepTime: "3-5 min"
  },
  {
    id: 22,
    name: "Vanilla Shake",
    description: "Classic vanilla bean milkshake with real Madagascar vanilla, finished with whipped cream and a cherry.",
    price: 28,
    category: "shakes",
    image: "https://images.unsplash.com/photo-1568901839119-631418a3910d?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 234,
    isPopular: true,
    isNew: false,
    calories: 520,
    prepTime: "3-5 min"
  },
  {
    id: 23,
    name: "Strawberry Shake",
    description: "Fresh strawberry milkshake blended with real strawberries and creamy vanilla ice cream.",
    price: 30,
    category: "shakes",
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 289,
    isPopular: true,
    isNew: false,
    calories: 540,
    prepTime: "3-5 min"
  },
  {
    id: 24,
    name: "Oreo Shake",
    description: "Crushed Oreo cookies blended with vanilla ice cream and milk, topped with cookie crumbles.",
    price: 35,
    category: "shakes",
    image: "https://images.unsplash.com/photo-1619158401201-8fa932695178?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 412,
    isPopular: true,
    isNew: false,
    calories: 680,
    prepTime: "3-5 min"
  },
  {
    id: 25,
    name: "Caramel Shake",
    description: "Buttery caramel swirled with vanilla ice cream, topped with caramel drizzle and sea salt.",
    price: 32,
    category: "shakes",
    image: "https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 198,
    isPopular: false,
    isNew: true,
    calories: 620,
    prepTime: "3-5 min"
  },

  // ICE CREAM (5 items)
  {
    id: 26,
    name: "Vanilla Scoop",
    description: "Two scoops of premium vanilla bean ice cream served in a crispy waffle cone.",
    price: 15,
    category: "ice-cream",
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 156,
    isPopular: false,
    isNew: false,
    calories: 320,
    prepTime: "2-3 min"
  },
  {
    id: 27,
    name: "Chocolate Sundae",
    description: "Chocolate ice cream topped with hot fudge, whipped cream, nuts, and a cherry.",
    price: 25,
    category: "ice-cream",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 267,
    isPopular: true,
    isNew: false,
    calories: 480,
    prepTime: "3-5 min"
  },
  {
    id: 28,
    name: "Strawberry Delight",
    description: "Fresh strawberry ice cream with strawberry sauce, fresh berries, and whipped cream.",
    price: 22,
    category: "ice-cream",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 189,
    isPopular: false,
    isNew: false,
    calories: 380,
    prepTime: "3-5 min"
  },
  {
    id: 29,
    name: "Banana Split",
    description: "Classic banana split with three ice cream flavors, toppings, nuts, and whipped cream.",
    price: 35,
    category: "ice-cream",
    image: "https://images.unsplash.com/photo-1657225953401-5f95007fc8e0?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.7,
    reviews: 234,
    isPopular: true,
    isNew: false,
    calories: 720,
    prepTime: "5-7 min"
  },
  {
    id: 30,
    name: "Cookie Dough Cup",
    description: "Cookie dough ice cream loaded with chocolate chip cookie dough pieces in a cup.",
    price: 28,
    category: "ice-cream",
    image: "https://images.unsplash.com/photo-1629385701021-fcd568a743e8?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 198,
    isPopular: false,
    isNew: true,
    calories: 520,
    prepTime: "2-3 min"
  },

  // DESSERTS (5 items)
  {
    id: 31,
    name: "Chocolate Brownie",
    description: "Warm fudgy chocolate brownie served with vanilla ice cream and chocolate drizzle.",
    price: 20,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 312,
    isPopular: true,
    isNew: false,
    calories: 450,
    prepTime: "5-8 min"
  },
  {
    id: 32,
    name: "Cheesecake Slice",
    description: "Creamy New York style cheesecake with graham cracker crust and berry compote.",
    price: 30,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 389,
    isPopular: true,
    isNew: false,
    calories: 420,
    prepTime: "2-3 min"
  },
  {
    id: 33,
    name: "Apple Pie",
    description: "Warm cinnamon apple pie with flaky crust, served with vanilla ice cream.",
    price: 25,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 178,
    isPopular: false,
    isNew: false,
    calories: 380,
    prepTime: "5-8 min"
  },
  {
    id: 34,
    name: "Tiramisu",
    description: "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream.",
    price: 35,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 234,
    isPopular: true,
    isNew: false,
    calories: 350,
    prepTime: "2-3 min"
  },
  {
    id: 35,
    name: "Fruit Salad",
    description: "Fresh seasonal tropical fruits with honey lime dressing and mint.",
    price: 18,
    category: "desserts",
    image: "https://plus.unsplash.com/premium_photo-1664478279991-832059d65835?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.4,
    reviews: 123,
    isPopular: false,
    isNew: false,
    calories: 150,
    prepTime: "3-5 min"
  },

  // PASTRIES (5 items)
  {
    id: 36,
    name: "Butter Croissant",
    description: "Flaky, buttery French croissant baked fresh daily until golden perfection.",
    price: 15,
    category: "pastries",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 267,
    isPopular: true,
    isNew: false,
    calories: 280,
    prepTime: "1-2 min"
  },
  {
    id: 37,
    name: "Meat Pie",
    description: "Savory minced beef pie with vegetables in a golden flaky pastry shell.",
    price: 12,
    category: "pastries",
    image: "https://images.unsplash.com/photo-1608039783021-6116a558f0c5?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.6,
    reviews: 345,
    isPopular: true,
    isNew: false,
    calories: 320,
    prepTime: "2-3 min"
  },
  {
    id: 38,
    name: "Chicken Pie",
    description: "Creamy chicken and vegetable filling in a buttery pastry crust.",
    price: 14,
    category: "pastries",
    image: "https://plus.unsplash.com/premium_photo-1669557209263-94abeebafcdd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.7,
    reviews: 289,
    isPopular: true,
    isNew: false,
    calories: 340,
    prepTime: "2-3 min"
  },
  {
    id: 39,
    name: "Sausage Roll",
    description: "Seasoned pork sausage wrapped in golden puff pastry, served warm.",
    price: 10,
    category: "pastries",
    image: "https://images.unsplash.com/photo-1743012492397-c6680eaa2c5d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4.5,
    reviews: 198,
    isPopular: false,
    isNew: false,
    calories: 260,
    prepTime: "2-3 min"
  },
  {
    id: 40,
    name: "Glazed Doughnut",
    description: "Soft, fluffy ring doughnut with sweet vanilla glaze.",
    price: 8,
    category: "pastries",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 412,
    isPopular: true,
    isNew: false,
    calories: 220,
    prepTime: "1-2 min"
  },

  // CAKES (4 items)
  {
    id: 41,
    name: "Chocolate Cake Slice",
    description: "Rich, moist chocolate layer cake with chocolate ganache frosting.",
    price: 35,
    category: "cakes",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 456,
    isPopular: true,
    isNew: false,
    calories: 480,
    prepTime: "2-3 min"
  },
  {
    id: 42,
    name: "Red Velvet Slice",
    description: "Classic red velvet cake with cream cheese frosting and red velvet crumbs.",
    price: 38,
    category: "cakes",
    image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 378,
    isPopular: true,
    isNew: false,
    calories: 520,
    prepTime: "2-3 min"
  },
  {
    id: 43,
    name: "Carrot Cake Slice",
    description: "Spiced carrot cake with walnuts and cream cheese frosting.",
    price: 32,
    category: "cakes",
    image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 198,
    isPopular: false,
    isNew: false,
    calories: 450,
    prepTime: "2-3 min"
  },
  {
    id: 44,
    name: "Black Forest Slice",
    description: "German chocolate cake with cherries, whipped cream, and chocolate shavings.",
    price: 40,
    category: "cakes",
    image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 234,
    isPopular: false,
    isNew: true,
    calories: 550,
    prepTime: "2-3 min"
  }
];

// ============================================
// DEALS DATA
// ============================================
const deals = [
  {
    id: 1,
    title: "Triple Burger Feast",
    description: "3 Classic Burgers + Large Fries + 3 Drinks",
    originalPrice: 180,
    salePrice: 150,
    savings: 30,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&h=400&fit=crop",
    badge: "BEST SELLER",
    validUntil: "Limited Time",
    items: [1, 1, 1]
  },
  {
    id: 2,
    title: "Burger & Ice Cream Combo",
    description: "Any Burger + Chocolate Sundae + Drink",
    originalPrice: 100,
    salePrice: 85,
    savings: 15,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
    badge: "POPULAR",
    validUntil: "This Week Only",
    items: [1, 27]
  },
  {
    id: 3,
    title: "Family Pizza Deal",
    description: "2 Large Pizzas + Garlic Bread + 4 Drinks",
    originalPrice: 250,
    salePrice: 200,
    savings: 50,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&h=400&fit=crop",
    badge: "FAMILY SIZE",
    validUntil: "Weekends",
    items: [10, 11]
  },
  {
    id: 4,
    title: "Shake & Cake Combo",
    description: "Any Milkshake + Any Cake Slice",
    originalPrice: 70,
    salePrice: 55,
    savings: 15,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop",
    badge: "SWEET DEAL",
    validUntil: "All Week",
    items: [24, 41]
  },
  {
    id: 5,
    title: "Sandwich Lunch Special",
    description: "Any Sandwich + Fries + Drink",
    originalPrice: 75,
    salePrice: 60,
    savings: 15,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop",
    badge: "LUNCH DEAL",
    validUntil: "Mon-Fri 11AM-3PM",
    items: [16]
  }
];

// ============================================
// CATEGORIES DATA
// ============================================
const categories = [
  { id: "all", name: "All Items", icon: "🍽️", count: 44 },
  { id: "burgers", name: "Burgers", icon: "🍔", count: 8 },
  { id: "pizza", name: "Pizza", icon: "🍕", count: 7 },
  { id: "sandwiches", name: "Sandwiches", icon: "🥪", count: 5 },
  { id: "shakes", name: "Shakes", icon: "🥤", count: 5 },
  { id: "ice-cream", name: "Ice Cream", icon: "🍦", count: 5 },
  { id: "desserts", name: "Desserts", icon: "🍰", count: 5 },
  { id: "pastries", name: "Pastries", icon: "🥐", count: 5 },
  { id: "cakes", name: "Cakes", icon: "🎂", count: 4 }
];

// ============================================
// BLOG POSTS DATA
// ============================================
const blogPosts = [
  {
    id: 1,
    title: "The History of Burgers: From Hamburg to Ghana",
    slug: "history-of-burgers",
    excerpt: "Discover the fascinating journey of the humble hamburger from its origins in Hamburg, Germany to becoming Ghana's favorite fast food.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=500&fit=crop",
    author: "Chef Kofi Mensah",
    authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "2024-01-15",
    category: "Food History",
    readTime: "5 min read",
    tags: ["burgers", "history", "food culture"]
  },
  {
    id: 2,
    title: "Why Pizza Became Africa's Favorite Fast Food",
    slug: "pizza-in-africa",
    excerpt: "From Italy to Africa, pizza has conquered taste buds across the continent. Here's why this Italian classic resonates so deeply with African food culture.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=500&fit=crop",
    author: "Ama Owusu",
    authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    date: "2024-01-20",
    category: "Food Culture",
    readTime: "4 min read",
    tags: ["pizza", "africa", "culture"]
  },
  {
    id: 3,
    title: "5 Must-Try Street Foods in Accra",
    slug: "accra-street-food",
    excerpt: "Beyond the restaurants, Accra's streets are alive with incredible food experiences. Here are the top 5 street foods every food lover must try.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop",
    author: "Kwame Asante",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    date: "2024-01-25",
    category: "Street Food",
    readTime: "6 min read",
    tags: ["street food", "accra", "local"]
  },
  {
    id: 4,
    title: "The Perfect Milkshake: Our Secret Recipe",
    slug: "perfect-milkshake",
    excerpt: "What makes SWIFT CHOW's milkshakes so irresistible? Our head chef reveals the secrets behind our legendary shakes.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&h=500&fit=crop",
    author: "Chef Kofi Mensah",
    authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "2024-02-01",
    category: "Behind the Scenes",
    readTime: "4 min read",
    tags: ["milkshakes", "recipes", "secrets"]
  },
  {
    id: 5,
    title: "Fast Food and Family: Creating Memories at SWIFT CHOW",
    slug: "fast-food-family",
    excerpt: "Fast food isn't just about quick meals – it's about creating memories. Here's why family dining matters to us.",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=500&fit=crop",
    author: "Ama Owusu",
    authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    date: "2024-02-05",
    category: "Community",
    readTime: "5 min read",
    tags: ["family", "community", "memories"]
  },
  {
    id: 6,
    title: "How We Source Our Ingredients Locally",
    slug: "local-sourcing",
    excerpt: "Supporting Ghanaian farmers and producers is at the heart of what we do. Here's how we source our ingredients locally.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=500&fit=crop",
    author: "Kwame Asante",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    date: "2024-02-10",
    category: "Sustainability",
    readTime: "5 min read",
    tags: ["local", "sustainability", "farmers"]
  },
  {
    id: 7,
    title: "Healthy Choices at Fast Food Restaurants",
    slug: "healthy-fast-food",
    excerpt: "Fast food doesn't have to be unhealthy. Here's how to make nutritious choices when dining at SWIFT CHOW.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop",
    author: "Dr. Abena Mensah",
    authorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
    date: "2024-02-15",
    category: "Health",
    readTime: "5 min read",
    tags: ["health", "nutrition", "tips"]
  },
  {
    id: 8,
    title: "The Rise of Food Delivery in Ghana",
    slug: "food-delivery-ghana",
    excerpt: "Food delivery has transformed how Ghanaians eat. Here's how SWIFT CHOW is leading the delivery revolution.",
    image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&h=500&fit=crop",
    author: "Kofi Mensah",
    authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "2024-02-20",
    category: "Industry",
    readTime: "6 min read",
    tags: ["delivery", "technology", "ghana"]
  },
  {
    id: 9,
    title: "Behind the Scenes: A Day at SWIFT CHOW Kitchen",
    slug: "behind-the-scenes",
    excerpt: "Ever wondered what happens behind the counter? Take an exclusive tour of our kitchen operations.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop",
    author: "Chef Kofi Mensah",
    authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "2024-02-25",
    category: "Behind the Scenes",
    readTime: "5 min read",
    tags: ["kitchen", "behind the scenes", "operations"]
  },
  {
    id: 10,
    title: "Customer Spotlight: Your Favorite Orders",
    slug: "customer-favorites",
    excerpt: "We asked our customers about their favorite SWIFT CHOW orders. Here's what they said!",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=500&fit=crop",
    author: "SWIFT CHOW Team",
    authorImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop",
    date: "2024-03-01",
    category: "Community",
    readTime: "4 min read",
    tags: ["customers", "favorites", "community"]
  }
];

// ============================================
// REVIEWS DATA
// ============================================
const reviews = [
  {
    id: 1,
    name: "Kwame Mensah",
    location: "Accra",
    rating: 5,
    title: "Best Burgers in Ghana!",
    comment: "I've been coming to SWIFT CHOW for months now, and the quality is consistently amazing. The Cheese Burger Deluxe is my absolute favorite – perfectly cooked patty, melted cheese, and that special sauce is incredible!",
    date: "2024-03-10",
    orderItems: ["Cheese Burger Deluxe", "Oreo Shake"],
    verified: true,
    helpful: 24,
    avatar: "KM"
  },
  {
    id: 2,
    name: "Ama Serwaa",
    location: "East Legon",
    rating: 5,
    title: "Our Family's Favorite Place",
    comment: "We visit SWIFT CHOW every Sunday after church. The kids love the pizza, my husband loves the burgers, and I love the milkshakes. Great family atmosphere and the staff are always friendly.",
    date: "2024-03-08",
    orderItems: ["Pepperoni Pizza", "Classic Beef Burger", "Chocolate Shake"],
    verified: true,
    helpful: 18,
    avatar: "AS"
  },
  {
    id: 3,
    name: "Kofi Asante",
    location: "Tema",
    rating: 4,
    title: "Great Food, Quick Delivery",
    comment: "Ordered delivery to Tema and was impressed by how fast it arrived. Food was still hot! Only giving 4 stars because the fries were slightly less crispy than in-store, but the burger was perfect.",
    date: "2024-03-05",
    orderItems: ["Double Stack Burger", "Vanilla Shake"],
    verified: true,
    helpful: 12,
    avatar: "KA"
  },
  {
    id: 4,
    name: "Abena Pokua",
    location: "Osu",
    rating: 5,
    title: "The Oreo Shake Changed My Life",
    comment: "I'm not exaggerating when I say the Oreo Shake is the best thing I've ever tasted. Thick, creamy, loaded with Oreos. I come here just for the shake sometimes!",
    date: "2024-03-03",
    orderItems: ["Oreo Shake", "Chocolate Brownie"],
    verified: true,
    helpful: 31,
    avatar: "AP"
  },
  {
    id: 5,
    name: "Emmanuel Tetteh",
    location: "Spintex",
    rating: 5,
    title: "Pizza Perfection",
    comment: "The BBQ Chicken Pizza is outstanding. Generous toppings, perfect crust, and the BBQ sauce is just the right amount of tangy and sweet. Better than any chain pizza!",
    date: "2024-02-28",
    orderItems: ["BBQ Chicken Pizza", "Strawberry Shake"],
    verified: true,
    helpful: 15,
    avatar: "ET"
  },
  {
    id: 6,
    name: "Serwa Addo",
    location: "Achimota",
    rating: 4,
    title: "Good Food, Could Use More Seating",
    comment: "The food is excellent – had the Club Sandwich and it was fresh and filling. My only complaint is that the restaurant gets crowded on weekends and seating is limited. But worth the wait!",
    date: "2024-02-25",
    orderItems: ["Club Sandwich", "Caramel Shake"],
    verified: true,
    helpful: 8,
    avatar: "SA"
  },
  {
    id: 7,
    name: "Yaw Mensah",
    location: "Dansoman",
    rating: 5,
    title: "Birthday Party Success!",
    comment: "Hosted my son's 8th birthday party here and it was amazing. The staff helped with decorations, the kids' meals were perfect, and everyone loved the cake. Thank you SWIFT CHOW!",
    date: "2024-02-20",
    orderItems: ["Kids Meal x10", "Chocolate Cake", "Ice Cream Sundae x10"],
    verified: true,
    helpful: 22,
    avatar: "YM"
  },
  {
    id: 8,
    name: "Akua Nyarko",
    location: "Cantonments",
    rating: 5,
    title: "Fresh Ingredients Make the Difference",
    comment: "You can really taste the freshness in SWIFT CHOW's food. The vegetables are crisp, the meat is quality, and nothing tastes processed. It's fast food done right.",
    date: "2024-02-15",
    orderItems: ["Grilled Chicken Sandwich", "Fruit Salad"],
    verified: true,
    helpful: 19,
    avatar: "AN"
  },
  {
    id: 9,
    name: "Prince Owusu",
    location: "Madina",
    rating: 5,
    title: "Late Night Lifesaver",
    comment: "When you're craving good food late at night, SWIFT CHOW delivers – literally! Their delivery is fast even at 9 PM, and the food quality doesn't drop. Highly recommend!",
    date: "2024-02-10",
    orderItems: ["Spicy Jerk Burger", "Chocolate Shake"],
    verified: true,
    helpful: 14,
    avatar: "PO"
  },
  {
    id: 10,
    name: "Efua Mensimah",
    location: "Labone",
    rating: 4,
    title: "Great Vegetarian Options",
    comment: "As a vegetarian, I often struggle to find good options at fast food places. SWIFT CHOW's Veggie Burger and Veggie Wrap are genuinely delicious – not just afterthoughts. Would love even more veggie options!",
    date: "2024-02-05",
    orderItems: ["Veggie Burger", "Veggie Wrap", "Strawberry Shake"],
    verified: true,
    helpful: 26,
    avatar: "EM"
  }
];

// ============================================
// GHANA CITIES DATA
// ============================================
const ghanaCities = [
  { name: "Accra", deliveryFee: 15, available: true, estimatedTime: "30-45 min" },
  { name: "Tema", deliveryFee: 20, available: false, estimatedTime: "45-60 min" },
  { name: "Kumasi", deliveryFee: 25, available: false, estimatedTime: "60-90 min" },
  { name: "Tamale", deliveryFee: 30, available: false, estimatedTime: "90-120 min" },
  { name: "Takoradi", deliveryFee: 25, available: false, estimatedTime: "60-90 min" },
  { name: "Cape Coast", deliveryFee: 25, available: false, estimatedTime: "60-90 min" },
  { name: "Koforidua", deliveryFee: 22, available: false, estimatedTime: "50-70 min" },
  { name: "Sunyani", deliveryFee: 28, available: false, estimatedTime: "75-100 min" },
  { name: "Ho", deliveryFee: 28, available: false, estimatedTime: "75-100 min" },
  { name: "Obuasi", deliveryFee: 30, available: false, estimatedTime: "90-120 min" }
];

// ============================================
// HELPER FUNCTIONS
// ============================================
function getRelatedBlogPosts(currentId, limit = 3) {
  return blogPosts.filter(post => post.id !== currentId).slice(0, limit);
}

// Export for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    foodItems,
    deals,
    categories,
    blogPosts,
    reviews,
    ghanaCities,
    getRelatedBlogPosts
  };
}
