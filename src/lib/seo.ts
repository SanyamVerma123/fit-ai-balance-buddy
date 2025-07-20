// SEO optimization for FitAI Calories Tracker

export const seoConfig = {
  title: "FitAI Calories Tracker - AI-Powered Fitness & Nutrition App",
  description: "Track your calories, meals, workouts, and water intake with AI assistance. Get personalized nutrition advice and achieve your fitness goals with voice-enabled features.",
  keywords: [
    "calorie tracker",
    "AI fitness coach",
    "nutrition tracker",
    "workout tracker",
    "water intake tracker",
    "voice input",
    "meal planning",
    "fitness app",
    "weight loss",
    "weight gain",
    "health tracker",
    "AI nutrition",
    "food recognition",
    "fitness goals"
  ],
  openGraph: {
    title: "FitAI Calories Tracker - AI-Powered Fitness & Nutrition",
    description: "Track calories, meals, and workouts with AI assistance. Voice-enabled features for easy logging.",
    type: "website",
    url: "https://your-domain.com", // Replace with actual domain
    image: "/hero-banner.jpg",
    siteName: "FitAI Calories Tracker"
  },
  twitter: {
    card: "summary_large_image",
    title: "FitAI Calories Tracker - AI-Powered Fitness & Nutrition",
    description: "Track calories, meals, and workouts with AI assistance. Voice-enabled features for easy logging.",
    image: "/hero-banner.jpg"
  },
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "FitAI Calories Tracker",
    "description": "AI-powered fitness and nutrition tracking application with voice input capabilities",
    "url": "https://your-domain.com", // Replace with actual domain
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Calorie tracking",
      "AI nutrition advice",
      "Voice input",
      "Meal planning",
      "Workout tracking",
      "Water intake monitoring",
      "Progress analytics",
      "Food photo recognition"
    ]
  }
};

export const generateMetaTags = () => {
  return `
    <title>${seoConfig.title}</title>
    <meta name="description" content="${seoConfig.description}" />
    <meta name="keywords" content="${seoConfig.keywords.join(', ')}" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${seoConfig.openGraph.title}" />
    <meta property="og:description" content="${seoConfig.openGraph.description}" />
    <meta property="og:type" content="${seoConfig.openGraph.type}" />
    <meta property="og:url" content="${seoConfig.openGraph.url}" />
    <meta property="og:image" content="${seoConfig.openGraph.image}" />
    <meta property="og:site_name" content="${seoConfig.openGraph.siteName}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="${seoConfig.twitter.card}" />
    <meta name="twitter:title" content="${seoConfig.twitter.title}" />
    <meta name="twitter:description" content="${seoConfig.twitter.description}" />
    <meta name="twitter:image" content="${seoConfig.twitter.image}" />
    
    <!-- Additional SEO -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="FitAI Calories Tracker" />
    <link rel="canonical" href="${seoConfig.openGraph.url}" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
      ${JSON.stringify(seoConfig.structuredData, null, 2)}
    </script>
  `;
};