import { Product, LookbookItem, Order, HeroConfig } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'bag-1',
    name: 'The Bacio Satin Baggette with Oversized Bow',
    slug: 'bacio-satin-baggette',
    price: 345,
    compare_at_price: 385,
    category: 'Ribbon & Bow Editions',
    description: 'Our signature silhouette crafted in heavyweight lustrous Italian duchess satin in our Osu atelier, Accra. Finished with an exaggerated double-drape bow, dainty silver logo coin, and concealed magnetic flap closure.',
    details: [
      'Delicate hand-tied double bow detail with soft draped tails',
      'Lined in signature ballet-pink grosgrain with interior card pocket',
      'Concealed magnetic snap flap closure',
      'Engraved silver-tone Baggette heart charm at zipper',
      'Shoulder drop: 9.5 inches (fits comfortably over blazers & lightweight knits)'
    ],
    materials: '100% Italian Duchess Satin with 100% Cotton Grosgrain lining; Custom silver palladium hardware',
    dimensions: '10.5" W x 5.25" H x 2.75" D',
    care: 'Spot clean delicately with damp cotton cloth. Store in provided dustbag with bow laid flat.',
    colors: [
      { name: 'Noir Black', hex: '#111111', inStock: true },
      { name: 'Ballet Slippers Pink', hex: '#FAD8DD', inStock: true },
      { name: 'Cherry Red', hex: '#A81C2E', inStock: true },
      { name: 'Ivory Pearl', hex: '#FAF7F0', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['BESTSELLER', 'RIBBON EDITION'],
    stock_quantity: 14,
    is_featured: true,
    created_at: '2026-01-10T12:00:00Z'
  },
  {
    id: 'bag-2',
    name: 'The Osu Pleated Leather Baggette',
    slug: 'osu-pleated-baggette',
    price: 460,
    category: 'Baggettes',
    description: 'Sculptural knife-pleated calf leather baggette inspired by the vibrant creative pulse of Osu, Accra, and vintage 90s shoulder silhouettes. Features chunky polished nickel grommets and a keepsake key charm.',
    details: [
      'Accordion knife-pleated sides for expandable capacity',
      'Removable metal antique key & ribbon charm',
      'Top zip with extended pull tab',
      'Interior zip compartment and embossed serial number'
    ],
    materials: '100% Supple full-grain nappa leather; nickel-free silver hardware',
    dimensions: '11.0" W x 4.75" H x 3.0" D',
    care: 'Condition periodically with leather balm. Keep away from water and oil.',
    colors: [
      { name: 'Espresso Bean', hex: '#2A1D1A', inStock: true },
      { name: 'Butter Pecan', hex: '#F0DEC3', inStock: true },
      { name: 'Pistachio Sage', hex: '#A3B49B', inStock: false }
    ],
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['NEW ARRIVAL'],
    stock_quantity: 8,
    is_featured: true,
    created_at: '2026-02-01T14:30:00Z'
  },
  {
    id: 'bag-3',
    name: 'The Cantonments Ballet Puffer Cloud Shoulder',
    slug: 'cantonments-ballet-puffer',
    price: 295,
    category: 'Totes & Shoulders',
    description: 'Ultra-lightweight cloud quilted nylon bag with ruched scrunchie shoulder strap and mini grosgrain side ties. Perfect for carrying everyday treasures from Cantonments cafes to gallery afternoons in Accra.',
    details: [
      'Cloud pillowed quilting with hypoallergenic micro-fill',
      'Comfortable ruched ruffle shoulder strap',
      'Dual side drawstring bows for adjustable cinching',
      'Water-repellent technical memory nylon shell'
    ],
    materials: 'Recycled technical memory nylon, poly fill, metal hardware',
    dimensions: '13.0" W x 8.0" H x 4.0" D',
    care: 'Machine wash cold on gentle cycle in mesh laundry bag. Air dry completely.',
    colors: [
      { name: 'Powder Rose', hex: '#F4C8D0', inStock: true },
      { name: 'Midnight Onyx', hex: '#1C1B1B', inStock: true },
      { name: 'Oatmeal Heather', hex: '#DCD4C7', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['STAFF SWEETHEART'],
    stock_quantity: 19,
    is_featured: true,
    created_at: '2026-01-20T09:00:00Z'
  },
  {
    id: 'bag-4',
    name: 'The Pierrot Petite Silk Satin Pouch',
    slug: 'pierrot-petite-satin-pouch',
    price: 210,
    category: 'Minis & Pouches',
    description: 'An evening miniature drawstring purse with ruffled frilled collar and delicate freshwater seed-pearl cord ties. Designed to dance in your hand from dinners at Labone to evening celebrations in Airport City.',
    details: [
      'Gathers into a ruffled rosette neckline with pearl tassels',
      'Detachable delicate rolo cross-body chain',
      'Embroidered mini rose insignia on base',
      'Holds all smartphones up to Pro Max size'
    ],
    materials: 'Pure silk crepe-back satin; natural freshwater cultured seed pearls',
    dimensions: '7.5" W x 8.0" H x 4.0" D',
    care: 'Dry clean only by silk specialist. Keep pearls safe from perfumes.',
    colors: [
      { name: 'Snow Cream', hex: '#FAF6EE', inStock: true },
      { name: 'Rosewater', hex: '#F7C6CF', inStock: true },
      { name: 'Jet Noir', hex: '#0F0F0F', inStock: false }
    ],
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1614179689702-355944cd0918?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['LIMITED QUANTITY'],
    stock_quantity: 4,
    is_featured: false,
    created_at: '2026-02-10T16:00:00Z'
  },
  {
    id: 'bag-5',
    name: 'The Makola Gingham Ribbon Utility Tote',
    slug: 'makola-gingham-utility-tote',
    price: 185,
    category: 'Totes & Shoulders',
    description: 'Heavyweight organic cotton canvas tote in nostalgic sage & cream gingham checks. Inspired by bustling market mornings and breezy afternoon strolls, adorned with exterior cargo slip pockets and scarlet ribbon ties.',
    details: [
      'Four exterior slip compartments for water bottle, notebook & umbrella',
      'Two ribbon bow tie closures across open top',
      'Reinforced box-stitch shoulder straps for heavy market hauls',
      'Interior zippered safety pocket and key lanyard snap'
    ],
    materials: '16oz Organic Cotton Canvas, dyed with low-impact pigments',
    dimensions: '16.0" W x 14.5" H x 5.5" D',
    care: 'Cold spot wash or gentle hand wash, line dry inside out in shade.',
    colors: [
      { name: 'Sage Gingham', hex: '#738C7A', inStock: true },
      { name: 'Sky Gingham', hex: '#87A8C2', inStock: true },
      { name: 'Bordeaux Gingham', hex: '#873241', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['EVERYDAY ICON'],
    stock_quantity: 26,
    is_featured: true,
    created_at: '2026-01-05T10:00:00Z'
  },
  {
    id: 'bag-6',
    name: 'The Airport Hills Floral Crystal Buckle Baggette',
    slug: 'airport-hills-crystal-buckle-baggette',
    price: 520,
    category: 'Ribbon & Bow Editions',
    description: 'A dazzling statement piece from our Accra atelier. Smooth semi-patent leather with an antique crystal blossom buckle centerstage, surrounded by a delicate stitched lace scalloped trim.',
    details: [
      'Custom hand-set crystal blossom centerpiece',
      'Scalloped lace edge piping along front flap',
      'Adjustable strap for underarm or crook-of-arm carrying',
      'Back exterior magnetic slit pocket'
    ],
    materials: 'Calf patent leather, Austrian crystals, silver alloy hardware',
    dimensions: '10.0" W x 5.0" H x 2.5" D',
    care: 'Gently buff with micro-fiber polishing cloth. Avoid direct excessive heat.',
    colors: [
      { name: 'Patent Cherry', hex: '#911B2C', inStock: true },
      { name: 'Patent Licorice', hex: '#161616', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['RUNWAY PIECE'],
    stock_quantity: 6,
    is_featured: false,
    created_at: '2026-02-12T11:00:00Z'
  },
  {
    id: 'bag-7',
    name: 'The Jamestown Micro Bow Crossbody Coin Bag',
    slug: 'jamestown-micro-bow-crossbody',
    price: 155,
    category: 'Minis & Pouches',
    description: 'Playful mini companion bag with three handmade satin micro bows. Inspired by the coastal breeze and timeless architecture of Jamestown, Accra.',
    details: [
      'Trio of delicate handmade satin micro-bows',
      'Includes detachable 42-inch slender leather cord strap',
      'Polished silver dog-clip for easy tote attachment',
      'Fits AirPods, lipstick, keys, and emergency cash'
    ],
    materials: 'Grainy calfskin leather, satin ribbons, polished rhodium clips',
    dimensions: '4.5" W x 3.75" H x 1.5" D',
    care: 'Wipe with soft clean cloth. Keep away from rough abrasive surfaces.',
    colors: [
      { name: 'Baby Pink', hex: '#F9D1D7', inStock: true },
      { name: 'Silver Foil', hex: '#D7D8DA', inStock: true },
      { name: 'Ink Noir', hex: '#1A1A1A', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['GIFT FAVORITE'],
    stock_quantity: 22,
    is_featured: false,
    created_at: '2026-01-25T15:20:00Z'
  },
  {
    id: 'bag-8',
    name: 'The East Legon Cargo Zip Sling Baggette',
    slug: 'east-legon-cargo-zip-sling',
    price: 375,
    category: 'Baggettes',
    description: 'Utilitarian chic meets delicate feminine charm. Featuring asymmetrical zip pockets, oversized ring pullers, and a sweet detachable ribbon rosette brooch.',
    details: [
      'Three front cargo zip pockets with oversized ring pulls',
      'Detachable handmade double-face grosgrain rosette pin',
      'Chunky adjustable seatbelt webbing strap with engraved quick-release buckle',
      'Padded mesh backing for breathable city roaming'
    ],
    materials: 'Treated ballistic Cordura nylon & smooth leather trim',
    dimensions: '11.5" W x 5.5" H x 3.5" D',
    care: 'Wipe clean with mild soap suds and air dry.',
    colors: [
      { name: 'Washed Army Olive', hex: '#585F49', inStock: true },
      { name: 'Asphalt Black', hex: '#262626', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['UTILITY CHIC'],
    stock_quantity: 11,
    is_featured: false,
    created_at: '2026-02-05T13:45:00Z'
  }
];

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  badgeText: 'Spring/Summer 2026 Collection',
  title: 'Bags that feel like ribbons tied in a hurry.',
  subtitle: 'Handcrafted in our Accra atelier with delicate duchess satins, knife pleats, cloud puffers, and bows. Made for sunny walks across Osu, Cantonments, and beyond.',
  fig1ProductId: 'bag-1',
  fig1Caption: 'Fig. 01 — Osu Atelier',
  fig2ProductId: 'bag-2',
  fig2Caption: 'Fig. 02 — Cantonments Walk',
  note1: 'Hand-finished ribbons',
  note2: 'Crafted in our Accra atelier',
  note3: 'Italian duchess satins'
};

export const LOOKBOOK_STORIES: LookbookItem[] = [
  {
    id: 'look-1',
    title: 'Spring Sunday on Oxford Street',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    season: 'SS26 Editorial',
    location: 'Osu, Accra, Ghana',
    featuredProductId: 'bag-1',
    quote: '"I like bags that feel like a ribbon you found on the floor of a ballet studio that happens to carry your entire life."'
  },
  {
    id: 'look-2',
    title: 'Warm Hibiscus Tea & Golden Afternoon',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    season: 'Archive Notes',
    location: 'Cantonments, Accra, Ghana',
    featuredProductId: 'bag-2',
    quote: '"Pleats that stretch when you grab warm pastries and two extra ginger candies."'
  },
  {
    id: 'look-3',
    title: 'Coastal Breeze & Seaside Shadows',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80',
    season: 'Accra Utility',
    location: 'Jamestown, Accra, Ghana',
    featuredProductId: 'bag-3',
    quote: '"A bag as soft as a cloud, because warm coastal days are long and our shoulders deserve kindness."'
  }
];

export const SAMPLE_ORDERS: Order[] = [
  {
    id: 'BGT-8921',
    customer_email: 'chloe.mensah@baggette.com',
    customer_name: 'Chloe M.',
    shipping_address: {
      address: '14 Ring Road Central, Osu',
      city: 'Accra',
      state: 'Greater Accra',
      zip: 'GA-042-8821',
      country: 'Ghana',
      phone: '+233 24 456 7890'
    },
    items: [
      {
        product_id: 'bag-1',
        product_name: 'The Bacio Satin Baggette with Oversized Bow',
        price: 345,
        quantity: 1,
        color_name: 'Ballet Slippers Pink',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    subtotal: 345,
    shipping: 0,
    discount: 0,
    total: 345,
    status: 'Shipped',
    tracking_number: 'BGT-EXP-ACCRA-94001',
    created_at: '2026-03-01T14:22:00Z'
  },
  {
    id: 'BGT-8904',
    customer_email: 'ama.asantewaa@atelier.com',
    customer_name: 'Ama A.',
    shipping_address: {
      address: '28 Boundary Road, East Legon',
      city: 'Accra',
      state: 'Greater Accra',
      zip: 'GA-183-9021',
      country: 'Ghana',
      phone: '+233 50 123 4567'
    },
    items: [
      {
        product_id: 'bag-5',
        product_name: 'The Makola Gingham Ribbon Utility Tote',
        price: 185,
        quantity: 1,
        color_name: 'Sage Gingham',
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
      },
      {
        product_id: 'bag-7',
        product_name: 'The Jamestown Micro Bow Crossbody Coin Bag',
        price: 155,
        quantity: 1,
        color_name: 'Baby Pink',
        image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    subtotal: 340,
    shipping: 0,
    discount: 34,
    total: 306,
    status: 'Processing',
    tracking_number: 'BGT-EXP-ACCRA-88022',
    created_at: '2026-03-02T10:15:00Z'
  }
];
