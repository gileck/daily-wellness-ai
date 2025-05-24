const foodEmojiMap = {
    // Meats & Proteins
    'beef': '🥩',
    'chicken': '🍗',
    'turkey': '🦃',
    'pork': '🥓',
    'lamb': '🐑',
    'veal': '🥩',
    'duck': '🦆',
    'goose': '🦆',
    'bacon': '🥓',
    'sausage': '🌭',
    'ham': '🍖',
    'meat': '🍖',

    // Fish & Seafood
    'fish': '🐟',
    'salmon': '🍣',
    'tuna': '🐟',
    'cod': '🐟',
    'sardines': '🐟',
    'mackerel': '🐟',
    'halibut': '🐟',
    'trout': '🐟',
    'bass': '🐟',
    'haddock': '🐟',
    'pollock': '🐟',
    'anchovies': '🐟',
    'herring': '🐟',
    'flounder': '🐟',
    'sole': '🐟',
    'shrimp': '🦐',
    'crab': '🦀',
    'lobster': '🦞',
    'scallops': '🐚',
    'mussels': '🦪',
    'oysters': '🦪',
    'clams': '🐚',
    'squid': '🦑',
    'octopus': '🐙',
    'crustaceans': '🦀',

    // Dairy & Eggs
    'eggs': '🥚',
    'egg': '🥚',
    'milk': '🥛',
    'cheese': '🧀',
    'butter': '🧈',
    'cream': '🥛',
    'yogurt': '🥛',
    'cottage': '🧀', // cottage cheese

    // Vegetables
    'broccoli': '🥦',
    'carrots': '🥕',
    'carrot': '🥕',
    'spinach': '🥬',
    'lettuce': '🥬',
    'kale': '🥬',
    'cabbage': '🥬',
    'cauliflower': '🥦',
    'brussels': '🥬', // brussels sprouts
    'asparagus': '🥒',
    'celery': '🥒',
    'cucumber': '🥒',
    'zucchini': '🥒',
    'squash': '🎃',
    'pumpkin': '🎃',
    'eggplant': '🍆',
    'peppers': '🌶️',
    'pepper': '🌶️',
    'tomatoes': '🍅',
    'tomato': '🍅',
    'onions': '🧅',
    'onion': '🧅',
    'garlic': '🧄',
    'potatoes': '🥔',
    'potato': '🥔',
    'sweet': '🍠', // sweet potato
    'beets': '🌰',
    'radishes': '🌰',
    'turnips': '🌰',
    'parsnips': '🌰',
    'leeks': '🧅',
    'scallions': '🧅',
    'chives': '🌿',
    'parsley': '🌿',
    'cilantro': '🌿',
    'basil': '🌿',
    'oregano': '🌿',
    'thyme': '🌿',
    'rosemary': '🌿',
    'sage': '🌿',
    'mint': '🌿',

    // Fruits
    'apples': '🍎',
    'apple': '🍎',
    'bananas': '🍌',
    'banana': '🍌',
    'oranges': '🍊',
    'orange': '🍊',
    'lemons': '🍋',
    'lemon': '🍋',
    'limes': '🍋',
    'lime': '🍋',
    'grapes': '🍇',
    'strawberries': '🍓',
    'strawberry': '🍓',
    'blueberries': '🫐',
    'blueberry': '🫐',
    'raspberries': '🍓',
    'raspberry': '🍓',
    'blackberries': '🍓',
    'blackberry': '🍓',
    'cranberries': '🍒',
    'cranberry': '🍒',
    'cherries': '🍒',
    'cherry': '🍒',
    'peaches': '🍑',
    'peach': '🍑',
    'pears': '🍐',
    'pear': '🍐',
    'plums': '🍇',
    'plum': '🍇',
    'pineapple': '🍍',
    'mangoes': '🥭',
    'mango': '🥭',
    'avocados': '🥑',
    'avocado': '🥑',
    'kiwi': '🥝',
    'papaya': '🍈',
    'cantaloupe': '🍈',
    'honeydew': '🍈',
    'watermelon': '🍉',
    'melon': '🍈',
    'coconut': '🥥',
    'dates': '🌰',
    'figs': '🍇',
    'raisins': '🍇',
    'apricots': '🍑',
    'apricot': '🍑',
    'nectarines': '🍑',
    'nectarine': '🍑',
    'grapefruit': '🍊',
    'tangerine': '🍊',
    'applesauce': '🍎',

    // Grains & Cereals
    'rice': '🍚',
    'wheat': '🌾',
    'oats': '🌾',
    'barley': '🌾',
    'quinoa': '🌾',
    'corn': '🌽',
    'bread': '🍞',
    'pasta': '🍝',
    'noodles': '🍜',
    'cereal': '🥣',
    'flour': '🌾',
    'bran': '🌾',
    'bulgur': '🌾',
    'couscous': '🌾',
    'millet': '🌾',
    'buckwheat': '🌾',

    // Legumes & Nuts
    'beans': '🫘',
    'lentils': '🫘',
    'chickpeas': '🫘',
    'peas': '🫛',
    'soybeans': '🫘',
    'black': '🫘', // black beans
    'kidney': '🫘', // kidney beans
    'navy': '🫘', // navy beans
    'pinto': '🫘', // pinto beans
    'lima': '🫘', // lima beans
    'almonds': '🥜',
    'walnuts': '🥜',
    'pecans': '🥜',
    'cashews': '🥜',
    'pistachios': '🥜',
    'hazelnuts': '🥜',
    'macadamia': '🥜',
    'brazil': '🥜', // brazil nuts
    'peanuts': '🥜',
    'peanut': '🥜',
    'seeds': '🌰',
    'sunflower': '🌻', // sunflower seeds
    'pumpkin': '🎃', // pumpkin seeds
    'sesame': '🌰', // sesame seeds
    'flax': '🌰', // flax seeds
    'chia': '🌰', // chia seeds

    // Oils & Fats
    'oil': '🫒',
    'olive': '🫒',
    'coconut': '🥥', // coconut oil
    'avocado': '🥑', // avocado oil
    'canola': '🌻', // canola oil
    'sunflower': '🌻', // sunflower oil
    'safflower': '🌻', // safflower oil
    'sesame': '🌰', // sesame oil
    'peanut': '🥜', // peanut oil
    'corn': '🌽', // corn oil
    'soybean': '🫘', // soybean oil

    // Beverages
    'coffee': '☕',
    'tea': '🍵',
    'water': '💧',
    'juice': '🧃',
    'wine': '🍷',
    'beer': '🍺',
    'soda': '🥤',

    // Herbs & Spices
    'salt': '🧂',
    'pepper': '🌶️',
    'cinnamon': '🌰',
    'vanilla': '🌰',
    'ginger': '🌰',
    'turmeric': '🌰',
    'paprika': '🌶️',
    'cumin': '🌰',
    'coriander': '🌰',
    'cardamom': '🌰',
    'nutmeg': '🌰',
    'cloves': '🌰',
    'allspice': '🌰',
    'bay': '🌿', // bay leaves
    'dill': '🌿',
    'fennel': '🌿',
    'tarragon': '🌿',
    'chili': '🌶️',
    'cayenne': '🌶️',
    'mustard': '🌻', // mustard seeds
    'poppy': '🌰', // poppy seeds

    // Sweeteners
    'sugar': '🍯',
    'honey': '🍯',
    'maple': '🍁', // maple syrup
    'molasses': '🍯',
    'agave': '🍯',

    // Default fallback
    'food': '🍽️',
    'snack': '🍿',
    'drink': '🥤',
    'sauce': '🥄',
    'soup': '🍲',
    'salad': '🥗',
    'sandwich': '🥪',
};

