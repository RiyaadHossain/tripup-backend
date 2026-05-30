import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from 'generated/src/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const serviceCategories = [
  {
    name: 'Research & Strategy',
  },
  {
    name: 'Brand & Product',
  },
  {
    name: 'Marketing & Growth',
  },
];

const travelServices = [
  {
    slug: 'market-research-growth-strategy',
    title: 'Market Research & Growth Strategy',
    description:
      'Deep-dive insights, competitive analysis, and a clear growth roadmap tailored to your travel segment.',
    navLinsDesc:
      'Deep-dive insights, competitive analysis, and a clear growth roadmap tailored to your travel segment.',
    icon: 'Search',
    category: 'Research & Strategy',
    comingSoon: false,
    isPublished: true,
    displayOrder: 1,
    hero: {
      eyebrow: 'Market Research & Growth Strategy',
      headline: 'Find the real opportunities, then build a clear path to',
      highlightedText: 'scalable growth.',
      description:
        'Before you invest in branding, websites, ads, or content, you need clarity — and a plan. We help travel businesses uncover market gaps, validate demand, understand their audience, and turn those insights into a prioritized, actionable growth roadmap.',
      trustLine:
        'Built for travel brands that want to grow with confidence, not guesswork.',
    },
    problem: {
      headline: 'Effort without insight leads to',
      highlightedText: 'scattered momentum.',
      paragraph:
        'Teams chase channels, campaigns, and ideas without knowing what actually works. We help you identify real opportunities, set priorities, and build a growth strategy grounded in evidence — not assumptions.',
      painPoints: [
        {
          icon: 'Shuffle',
          text: 'Unclear positioning in a crowded travel market',
        },
        { icon: 'AlertTriangle', text: 'Too many channels, not enough focus' },
        {
          icon: 'Eye',
          text: 'Marketing decisions based on guesswork instead of data',
        },
        {
          icon: 'HelpCircle',
          text: 'Difficulty deciding what to do next or where to invest',
        },
      ],
    },
    capabilities: {
      heading: "What's included",
      intro:
        'A structured research and strategy engagement that gives your travel business clarity, direction, and an actionable growth roadmap.',
      items: [
        {
          title: 'Market Landscape Analysis',
          desc: 'Map the competitive environment, trends, and whitespace in your travel segment.',
          icon: 'Search',
        },
        {
          title: 'Competitor Positioning Review',
          desc: 'Understand how competitors position, price, and communicate — and where you can win.',
          icon: 'Target',
        },
        {
          title: 'Customer & Traveler Insights',
          desc: 'Clarify who your ideal traveler is, what they care about, and what drives their decisions.',
          icon: 'Users',
        },
        {
          title: 'Offer Validation & Mapping',
          desc: 'Assess your current offers against market demand and identify improvement opportunities.',
          icon: 'Layers',
        },
        {
          title: 'Messaging & Positioning Direction',
          desc: 'Define the strategic messaging direction that makes your brand easier to understand and choose.',
          icon: 'Compass',
        },
        {
          title: 'Channel & Acquisition Strategy',
          desc: 'Determine the most effective channels and acquisition tactics for sustainable growth.',
          icon: 'BarChart3',
        },
        {
          title: 'Funnel & Conversion Strategy',
          desc: 'Map and optimize your funnel to improve conversion at every stage.',
          icon: 'TrendingUp',
        },
        {
          title: 'Opportunity Identification',
          desc: "Discover overlooked gaps and positioning angles that competitors haven't claimed.",
          icon: 'Lightbulb',
        },
        {
          title: '30–90 Day Growth Roadmap',
          desc: 'A clear, actionable plan with prioritized next steps for immediate momentum.',
          icon: 'Map',
        },
        {
          title: 'Execution Sequencing',
          desc: 'Define the right order of initiatives so nothing is wasted.',
          icon: 'Zap',
        },
      ],
    },
    process: {
      eyebrow: 'Our Process',
      heading: 'How we uncover opportunities and build your growth roadmap',
      steps: [
        {
          number: '01',
          title: 'Discover',
          desc: 'Discovery and business context review to understand your goals, market, and current state.',
        },
        {
          number: '02',
          title: 'Analyse',
          desc: 'Market, competitor, and audience research to identify patterns, gaps, and opportunities.',
        },
        {
          number: '03',
          title: 'Strategize',
          desc: 'Opportunity mapping, priority definition, and channel & funnel strategy.',
        },
        {
          number: '04',
          title: 'Roadmap',
          desc: 'Prioritized execution roadmap with clear 30–90 day action steps.',
        },
      ],
    },
    deliverables: {
      heading: 'What you get',
      paragraph:
        'Every engagement delivers structured insights, strategic direction, and a clear plan you can act on immediately.',
      groups: [
        {
          label: 'Research',
          items: [
            'Research summary',
            'Market landscape overview',
            'Competitor benchmark',
            'Audience insights',
          ],
        },
        {
          label: 'Strategy',
          items: [
            'Positioning direction',
            'Opportunity map',
            'Channel & acquisition strategy',
            'Funnel recommendations',
          ],
        },
        {
          label: 'Execution',
          items: [
            'Strategic recommendations deck',
            '30–90 day growth roadmap',
            'Execution sequencing',
            'Priority framework',
          ],
        },
      ],
    },
    outcomes: {
      heading: 'What this unlocks for your travel business',
      items: [
        {
          title: 'Market Clarity',
          desc: 'Understand where you stand, where competitors win, and where your opportunity is.',
          icon: 'Search',
        },
        {
          title: 'Confident Direction',
          desc: 'Make branding, marketing, and product decisions backed by real evidence.',
          icon: 'Shield',
        },
        {
          title: 'Smarter Investment',
          desc: 'Stop guessing where to spend and start investing in what actually works.',
          icon: 'TrendingUp',
        },
        {
          title: 'Growth Readiness',
          desc: 'Enter your next phase with a clear, actionable strategy designed for your market.',
          icon: 'Sparkles',
        },
      ],
    },
    audience: {
      heading:
        'Built for travel businesses that need clarity and a plan before committing to execution',
      tags: [
        'Hotels & resorts',
        'Tour operators',
        'Travel startups',
        'Destination brands',
        'DMCs & travel agencies',
        'Hospitality groups',
      ],
      supportingLine:
        'Ideal for brands preparing to invest in branding, websites, marketing, or entering a new market — and those with traction who need a structured plan to scale.',
    },
    whyUs: {
      heading: 'Why TripUp Studio',
      paragraph:
        'Most agencies skip the research and jump straight to tactics. We start with evidence and strategy because building on assumptions is the most expensive mistake a travel brand can make.',
      points: [
        {
          title: 'Research-first approach',
          desc: "We don't guess — we validate opportunities before recommending execution.",
        },
        {
          title: 'Travel-specific expertise',
          desc: 'We understand travel demand cycles, booking psychology, seasonality, and destination marketing.',
        },
        {
          title: 'Strategy connected to execution',
          desc: 'Our research and roadmaps directly inform branding, websites, campaigns, and content.',
        },
        {
          title: 'One integrated partner',
          desc: 'From insight to strategy to execution, everything connects — no handoff gaps.',
        },
      ],
    },
    faq: {
      items: [
        {
          q: 'Is this just a market report?',
          a: 'No. This is a strategic engagement that combines deep research with a prioritized, actionable growth roadmap — not just data.',
        },
        {
          q: 'How long does this engagement take?',
          a: 'Typically 3–5 weeks depending on scope, complexity, and the depth of research and strategy required.',
        },
        {
          q: 'Can this work alongside an existing agency or team?',
          a: 'Yes. We can complement your existing partners by providing the strategic foundation they can execute against.',
        },
        {
          q: 'Do we need this before building a website?',
          a: 'In most cases, yes. A clear strategy ensures your website, messaging, and marketing efforts are aligned from day one.',
        },
        {
          q: 'What if we already know our audience?',
          a: 'Even experienced teams benefit from validating assumptions. We often uncover positioning gaps and opportunities that internal teams miss.',
        },
        {
          q: 'What if our priorities change?',
          a: 'The roadmap is designed to be flexible. We build in decision points so you can adapt as conditions evolve.',
        },
      ],
    },
    cta: {
      headline: 'Need clarity and a growth plan before you build or market?',
      subtext:
        "Let's identify the right opportunity and build a smarter roadmap. Start with a free discovery call.",
      ctaLabel: 'Book a Free Discovery Call',
    },
  },
  {
    slug: 'branding-identity',
    title: 'Branding & Identity',
    description:
      'Visual identity, positioning, and messaging systems built specifically for travel brands.',
    navLinsDesc:
      'Visual identity, positioning, and messaging systems built specifically for travel brands.',
    icon: 'Fingerprint',
    category: 'Brand & Product',
    comingSoon: false,
    isPublished: true,
    displayOrder: 2,
    hero: {
      eyebrow: 'Branding & Identity for Travel Businesses',
      headline: 'Make Your Brand Impossible to',
      highlightedText: 'Ignore',
      description:
        'We design brand systems that position your travel business clearly, communicate value effectively, and drive booking decisions.',
      trustLine:
        'Built for hotels, destinations, tour operators, travel startups, and experience-led brands.',
    },
    problem: {
      headline: 'If your brand feels generic,',
      highlightedText: 'your growth will too.',
      paragraph:
        'In a crowded tourism market, many businesses struggle to stand out because their positioning is unclear and branding feels inconsistent. This makes it harder to build trust and convert attention into bookings. Without a strong, cohesive brand, even great offers get overlooked.',
      painPoints: [
        {
          icon: 'Shuffle',
          text: 'Generic positioning that blends in with competitors',
        },
        {
          icon: 'AlertTriangle',
          text: 'Inconsistent messaging across website, social, and campaigns',
        },
        {
          icon: 'Eye',
          text: 'Visual identity that looks good but says very little',
        },
        {
          icon: 'HelpCircle',
          text: 'Difficulty communicating what makes the experience truly different',
        },
      ],
    },
    capabilities: {
      heading: 'What we do',
      intro:
        'We build travel brands from the inside out — combining strategy, story, and identity systems that make your business easier to understand, easier to trust, and easier to choose.',
      items: [
        {
          title: 'Brand Positioning',
          desc: 'Define what makes your travel business distinct, valuable, and relevant in the market.',
          icon: 'Target',
        },
        {
          title: 'Audience & Traveler Insights',
          desc: "Clarify who you're speaking to, what they care about, and what drives action.",
          icon: 'Users',
        },
        {
          title: 'Messaging Architecture',
          desc: 'Create clear messaging pillars, value propositions, and conversion-ready communication.',
          icon: 'MessageSquare',
        },
        {
          title: 'Brand Narrative & Storytelling',
          desc: 'Shape the emotional story behind the experience so the brand feels memorable and meaningful.',
          icon: 'BookOpen',
        },
        {
          title: 'Offer Clarity & Differentiation',
          desc: 'Make your packages, stays, tours, or experiences easier to understand and more compelling.',
          icon: 'Layers',
        },
        {
          title: 'Visual Identity Direction',
          desc: 'Develop visual references and creative direction that align with the strategy and experience.',
          icon: 'Palette',
        },
        {
          title: 'Tone of Voice Guidance',
          desc: 'Define how the brand should sound across website, campaigns, and social channels.',
          icon: 'Volume2',
        },
        {
          title: 'Experience-Led Brand Thinking',
          desc: 'Ensure the brand reflects the actual traveler journey, not just aesthetics.',
          icon: 'Compass',
        },
      ],
    },
    process: {
      eyebrow: 'Our Process',
      heading:
        'How we shape a brand that feels clear, consistent, and built for growth',
      steps: [
        {
          number: '01',
          title: 'Discover',
          desc: 'Research your market, traveler expectations, competitors, and current brand gaps.',
        },
        {
          number: '02',
          title: 'Define',
          desc: 'Clarify positioning, audience, messaging, and the core strategic direction.',
        },
        {
          number: '03',
          title: 'Design',
          desc: 'Translate strategy into narrative, voice, and visual identity direction.',
        },
        {
          number: '04',
          title: 'Deliver',
          desc: 'Package the brand system so it can be used consistently across website, content, and campaigns.',
        },
      ],
    },
    deliverables: {
      heading: 'What you get',
      paragraph:
        'Every branding engagement is built to give you clarity, consistency, and assets you can actually use across growth, content, and conversion.',
      groups: [
        {
          label: 'Strategy',
          items: [
            'Brand audit',
            'Competitive review',
            'Positioning framework',
            'Audience / traveler profile',
            'Differentiation map',
          ],
        },
        {
          label: 'Messaging',
          items: [
            'Messaging pillars',
            'Value proposition',
            'Brand story',
            'Offer framing',
            'Tone of voice guidance',
          ],
        },
        {
          label: 'Identity Direction',
          items: [
            'Visual identity direction',
            'Creative references / moodboards',
            'Art direction guidance',
            'Content style alignment',
          ],
        },
        {
          label: 'Activation',
          items: [
            'Website messaging guidance',
            'Campaign messaging direction',
            'Social and content alignment',
            'Internal brand consistency guidance',
          ],
        },
      ],
    },
    outcomes: {
      heading: 'What this unlocks for your travel business',
      items: [
        {
          title: 'Clearer Positioning',
          desc: 'Your audience instantly understands what makes your brand different.',
          icon: 'Target',
        },
        {
          title: 'Stronger Trust',
          desc: 'A cohesive identity creates confidence across every touchpoint.',
          icon: 'Shield',
        },
        {
          title: 'Better Conversion',
          desc: 'Clearer messaging and stronger differentiation improve decision-making.',
          icon: 'TrendingUp',
        },
        {
          title: 'Scalable Growth',
          desc: 'Your brand becomes easier to extend across website, campaigns, content, and partnerships.',
          icon: 'Sparkles',
        },
      ],
    },
    audience: {
      heading:
        'Built for travel businesses that need more than a prettier logo',
      tags: [
        'Hotels & boutique stays',
        'Tour operators',
        'Travel startups',
        'Destination brands',
        'DMCs & travel agencies',
        'Experience-led hospitality brands',
      ],
      supportingLine:
        'Ideal for brands preparing to relaunch, reposition, scale, or improve conversion across digital channels.',
    },
    whyUs: {
      heading: 'Why TripUp Studio',
      paragraph:
        'Most providers can give you visuals. Fewer can connect brand strategy to traveler psychology, digital experience, and long-term growth. TripUp Studio combines research, positioning, identity thinking, and execution so your brand is not only beautiful — it performs.',
      points: [
        {
          title: 'Strategy before aesthetics',
          desc: 'We define the business and traveler logic before shaping the visual direction.',
        },
        {
          title: 'Built for travel',
          desc: 'We understand destinations, experiences, bookings, and how travel brands actually earn trust.',
        },
        {
          title: 'Connected to growth',
          desc: 'Branding is designed to support websites, campaigns, search visibility, and conversion.',
        },
        {
          title: 'One partner, end-to-end',
          desc: 'From brand clarity to launch-ready execution, everything works as one system.',
        },
      ],
    },
    faq: {
      items: [
        {
          q: 'Do you only do logo design?',
          a: 'No. This service is focused on brand strategy, positioning, messaging, narrative, and identity direction — not just logo creation. The goal is to build a brand system that supports trust and growth.',
        },
        {
          q: 'Can you work with our existing website or team?',
          a: 'Yes. We can collaborate with your existing internal team, freelancers, or current website setup and align the branding work across all touchpoints.',
        },
        {
          q: 'Is this right for early-stage travel businesses?',
          a: 'Yes. This is especially useful for travel startups, new offers, repositioning efforts, or brands entering a more competitive market.',
        },
        {
          q: 'Will this help improve conversions?',
          a: 'Yes. Clear positioning, stronger messaging, and a more cohesive identity often improve trust, clarity, and decision-making across the customer journey.',
        },
        {
          q: 'Do you also implement the brand across the website and marketing?',
          a: 'Yes. TripUp Studio can also support website messaging, funnel design, content systems, and marketing execution after the brand strategy is defined.',
        },
      ],
    },
    cta: {
      headline: 'Ready to build a travel brand people actually remember?',
      subtext:
        "If your business feels hard to explain, hard to differentiate, or hard to grow, branding may be the missing layer. Start with a free discovery call and we'll help you see what needs clarity first.",
      ctaLabel: 'Book a Free Discovery Call',
    },
  },
  {
    slug: 'web-design-development',
    title: 'Product Design & Development',
    description:
      'Web and mobile apps engineered for travel operators, platforms, and experiences.',
    navLinsDesc:
      'Web and mobile apps engineered for travel operators, platforms, and experiences.',
    icon: 'Smartphone',
    category: 'Brand & Product',
    comingSoon: false,
    isPublished: true,
    displayOrder: 3,
    hero: {
      eyebrow: 'Product Design & Development for Travel Businesses',
      headline: 'Build Digital Systems That Turn Demand Into',
      highlightedText: 'Bookings',
      description:
        'We design and develop websites, apps, CRM, and automation systems that work together to turn demand into consistent business growth.',
      trustLine:
        'Built for travel brands that need a website that performs as well as it looks.',
    },
    problem: {
      headline: 'Most visitors leave before you get a chance to',
      highlightedText: 'convert them.',
      paragraph:
        "If your website doesn't instantly communicate trust and clarity, potential customers drop off within seconds. In travel, where decisions are quick and options are many, a weak first impression means lost bookings. A strong, intuitive experience is what turns interest into action.",
      painPoints: [
        { icon: 'Shuffle', text: 'Outdated or low-trust website design' },
        { icon: 'AlertTriangle', text: 'Poor mobile experience' },
        { icon: 'Eye', text: 'Confusing navigation or weak page structure' },
        { icon: 'HelpCircle', text: "Beautiful sites that don't convert" },
      ],
    },
    capabilities: {
      heading: "What's included",
      intro:
        'End-to-end web design and development built to create clarity, trust, and conversion for travel businesses.',
      items: [
        {
          title: 'UX & Page Structure',
          desc: 'Plan intuitive page flows that guide visitors toward action.',
          icon: 'Layout',
        },
        {
          title: 'Wireframing & Content Flow',
          desc: 'Map content hierarchy and user journeys before visual design begins.',
          icon: 'Layers',
        },
        {
          title: 'High-End UI Design',
          desc: 'Craft premium visual design that aligns with your brand identity.',
          icon: 'Palette',
        },
        {
          title: 'Responsive Development',
          desc: 'Build fast, responsive websites that work beautifully on every device.',
          icon: 'Smartphone',
        },
        {
          title: 'CMS Implementation',
          desc: 'Set up scalable content management so your team can update with ease.',
          icon: 'Code',
        },
        {
          title: 'Conversion-Focused Pages',
          desc: 'Design landing pages and core pages optimized for inquiries and bookings.',
          icon: 'MousePointerClick',
        },
        {
          title: 'Performance Optimization',
          desc: 'Ensure fast load times, accessibility, and technical excellence.',
          icon: 'Gauge',
        },
        {
          title: 'Launch Support',
          desc: 'Technical handoff, QA, and launch readiness to go live with confidence.',
          icon: 'Globe',
        },
      ],
    },
    process: {
      eyebrow: 'Our Process',
      heading: 'How we design and build websites that travel brands trust',
      steps: [
        {
          number: '01',
          title: 'Discover',
          desc: 'Discovery and goals alignment to understand your business, audience, and objectives.',
        },
        {
          number: '02',
          title: 'Architect',
          desc: 'UX strategy and page architecture to create the right structure and flow.',
        },
        {
          number: '03',
          title: 'Design',
          desc: 'Visual design system and mockups that bring your brand to life digitally.',
        },
        {
          number: '04',
          title: 'Build',
          desc: 'Development, responsive implementation, QA, and launch readiness.',
        },
      ],
    },
    deliverables: {
      heading: 'What you get',
      paragraph:
        'A complete website experience designed for clarity, trust, and conversion — ready to support your growth.',
      groups: [
        {
          label: 'Strategy',
          items: [
            'Page architecture',
            'Content flow plan',
            'UX recommendations',
            'Conversion mapping',
          ],
        },
        {
          label: 'Design',
          items: [
            'Wireframes',
            'High-fidelity designs',
            'Design system',
            'Mobile-first layouts',
          ],
        },
        {
          label: 'Development',
          items: [
            'Responsive website build',
            'CMS integration',
            'Performance optimization',
            'Core page templates',
          ],
        },
        {
          label: 'Launch',
          items: [
            'QA and testing',
            'Launch-ready assets',
            'Technical handoff',
            'Post-launch support guidance',
          ],
        },
      ],
    },
    outcomes: {
      heading: 'What this unlocks for your travel business',
      items: [
        {
          title: 'Premium First Impression',
          desc: 'A website that communicates credibility and quality from the first scroll.',
          icon: 'Globe',
        },
        {
          title: 'Stronger Conversion',
          desc: 'Clear structure and compelling design that turns visitors into leads or bookings.',
          icon: 'TrendingUp',
        },
        {
          title: 'Brand Consistency',
          desc: 'A digital experience that feels aligned with your positioning and identity.',
          icon: 'Shield',
        },
        {
          title: 'Scalable Foundation',
          desc: 'A website built to grow with your business, campaigns, and content.',
          icon: 'Sparkles',
        },
      ],
    },
    audience: {
      heading: 'Built for travel businesses that need more than a template',
      tags: [
        'Hotels & resorts',
        'Tour operators',
        'Travel startups',
        'Destination brands',
        'DMCs & agencies',
        'Experience-led hospitality',
      ],
      supportingLine:
        'Ideal for brands launching, relaunching, or upgrading their digital presence to match their market position.',
    },
    whyUs: {
      heading: 'Why TripUp Studio',
      paragraph:
        "Most web agencies focus on aesthetics. We connect brand strategy, UX thinking, and conversion logic so your website doesn't just look premium — it drives results.",
      points: [
        {
          title: 'Strategy-led design',
          desc: 'Every design decision is rooted in your positioning, audience, and business goals.',
        },
        {
          title: 'Built for travel',
          desc: 'We understand travel booking journeys, trust signals, and what makes travelers take action.',
        },
        {
          title: 'Performance-aware',
          desc: 'Speed, accessibility, and technical quality are part of the design process, not afterthoughts.',
        },
        {
          title: 'Connected to growth',
          desc: 'Your website is designed to support SEO, campaigns, content, and long-term scalability.',
        },
      ],
    },
    faq: {
      items: [
        {
          q: 'Do you build on specific platforms?',
          a: "We work with modern frameworks and CMS platforms suited to your needs — whether that's a custom build, headless CMS, or an existing platform like WordPress or Webflow.",
        },
        {
          q: 'Can you redesign our existing website?',
          a: 'Yes. We can work with your current site and reimagine the design, structure, and content flow while preserving what already works.',
        },
        {
          q: 'How long does a typical website project take?',
          a: 'Most projects take 6–12 weeks depending on scope, content readiness, and the number of pages involved.',
        },
        {
          q: 'Do you write the website content too?',
          a: 'We can provide content direction and messaging guidance. For full copywriting, we work with trusted content partners or your internal team.',
        },
        {
          q: 'Will the site be optimized for SEO?',
          a: 'Yes. Every site we build follows SEO best practices including page structure, metadata, performance, and content hierarchy.',
        },
      ],
    },
    cta: {
      headline: 'Need a website that feels premium and performs?',
      subtext:
        "Let's build a digital experience your travelers trust. Start with a free discovery call and we'll help you define the right approach.",
      ctaLabel: 'Book a Free Discovery Call',
    },
  },
  {
    slug: 'ai-automation',
    title: 'AI & Automation',
    description:
      'Custom AI agents and smart automations that streamline operations and personalise at scale.',
    navLinsDesc:
      'Custom AI agents and smart automations that streamline operations and personalise at scale.',
    icon: 'Bot',
    category: 'Brand & Product',
    comingSoon: true,
    isPublished: true,
    displayOrder: 4,
    hero: {
      eyebrow: 'AI & Automation for Travel Businesses',
      headline: 'Streamline operations and personalise at scale with',
      highlightedText: 'custom AI systems.',
      description:
        'Travel businesses often lose momentum in repetitive tasks, disconnected workflows, slow response times, and manual operational bottlenecks. We help brands identify where AI and automation can create leverage — from custom AI agents and internal process automation to smarter customer journeys and scalable personalization systems.',
      trustLine:
        'Built for travel brands ready to operate smarter and scale without adding overhead.',
    },
    problem: {
      headline: 'Systemize the work that slows you down —',
      highlightedText: 'let AI handle the rest.',
      paragraph:
        'Most travel businesses know they need smarter systems. The challenge is identifying where AI and automation create real leverage — not just adding tools, but designing workflows that genuinely reduce effort and improve outcomes.',
      painPoints: [
        {
          icon: 'Shuffle',
          text: 'Repetitive manual tasks slowing down the team',
        },
        {
          icon: 'Clock',
          text: 'Slow response times and inconsistent follow-up',
        },
        {
          icon: 'AlertTriangle',
          text: 'Disconnected tools and fragmented workflows',
        },
        {
          icon: 'TrendingUp',
          text: 'High operational overhead as the business grows',
        },
        { icon: 'Eye', text: "Personalization that doesn't scale" },
        {
          icon: 'HelpCircle',
          text: 'Missed opportunities to use AI where it creates real leverage',
        },
      ],
    },
    capabilities: {
      heading: "What's included",
      intro:
        'A structured approach to identifying, designing, and implementing AI and automation systems that create measurable operational leverage.',
      items: [
        {
          title: 'Workflow & Operations Audit',
          desc: 'Assess current workflows to identify friction, redundancy, and automation-ready processes.',
          icon: 'Search',
        },
        {
          title: 'Automation Opportunity Mapping',
          desc: 'Map the highest-impact areas where automation will save time and improve consistency.',
          icon: 'Workflow',
        },
        {
          title: 'Custom AI Use-Case Discovery',
          desc: 'Identify where AI agents and intelligent systems can solve real business problems.',
          icon: 'Bot',
        },
        {
          title: 'AI Agent Strategy',
          desc: 'Design AI agent direction for support, internal operations, or customer-facing experiences.',
          icon: 'Sparkles',
        },
        {
          title: 'Internal Process Automation',
          desc: 'Plan automation for internal workflows — from team operations to reporting and handoffs.',
          icon: 'Settings',
        },
        {
          title: 'Lead & Response Automation',
          desc: 'Build faster lead handling and follow-up systems that respond in real time.',
          icon: 'Zap',
        },
        {
          title: 'Journey Personalization',
          desc: 'Design personalization systems that adapt the customer experience at scale.',
          icon: 'Users',
        },
        {
          title: 'CRM & Communication Workflows',
          desc: 'Automate CRM, support, and communication workflows to reduce manual overhead.',
          icon: 'MessageSquare',
        },
      ],
    },
    process: {
      eyebrow: 'Our Process',
      heading: 'How we design AI and automation systems that scale',
      steps: [
        {
          number: '01',
          title: 'Discover',
          desc: 'Business workflow discovery and operational bottleneck identification.',
        },
        {
          number: '02',
          title: 'Map',
          desc: 'AI and automation opportunity mapping with priority use-case definition.',
        },
        {
          number: '03',
          title: 'Design',
          desc: 'System and tool recommendations with logic design and implementation direction.',
        },
        {
          number: '04',
          title: 'Scale',
          desc: 'Optimization for efficiency, scalability, and long-term operational improvement.',
        },
      ],
    },
    deliverables: {
      heading: 'What you get',
      paragraph:
        'A complete AI and automation framework with clear priorities, system recommendations, and an implementation roadmap.',
      groups: [
        {
          label: 'Audit',
          items: [
            'Workflow audit summary',
            'Operational bottleneck analysis',
            'Current systems assessment',
            'Efficiency baseline',
          ],
        },
        {
          label: 'Strategy',
          items: [
            'AI & automation opportunities map',
            'Priority use-case recommendations',
            'Custom AI system direction',
            'Tool stack recommendations',
          ],
        },
        {
          label: 'Design',
          items: [
            'Automation logic and process flows',
            'AI agent design direction',
            'Personalization system planning',
            'Integration recommendations',
          ],
        },
        {
          label: 'Roadmap',
          items: [
            'Systems improvement roadmap',
            'Implementation priority plan',
            'Scalability recommendations',
            'Optimization milestones',
          ],
        },
      ],
    },
    outcomes: {
      heading: 'What this unlocks for your travel business',
      items: [
        {
          title: 'Faster Execution',
          desc: 'Reduce manual workload and accelerate internal operations across the business.',
          icon: 'Zap',
        },
        {
          title: 'Consistent Workflows',
          desc: 'Build reliable, automated processes that run the same way every time.',
          icon: 'RefreshCw',
        },
        {
          title: 'Scalable Personalization',
          desc: 'Deliver personalized experiences across the customer journey without manual effort.',
          icon: 'Users',
        },
        {
          title: 'Operational Leverage',
          desc: 'Stronger systems that grow with your business and reduce overhead at scale.',
          icon: 'Sparkles',
        },
      ],
    },
    audience: {
      heading: 'Built for travel businesses ready to operate smarter',
      tags: [
        'Hotels & resorts',
        'Tour operators',
        'Travel startups',
        'Destination brands',
        'DMCs & agencies',
        'Experience-led hospitality',
      ],
      supportingLine:
        'Ideal for brands looking to reduce manual overhead, automate key workflows, and use AI where it creates real impact.',
    },
    whyUs: {
      heading: 'Why TripUp Studio',
      paragraph:
        'Most providers focus on tools. We focus on outcomes — connecting AI and automation to the operational challenges that actually slow growth down.',
      points: [
        {
          title: 'Outcome-driven approach',
          desc: 'We design systems around business impact, not just tool features or technical novelty.',
        },
        {
          title: 'Built for travel',
          desc: 'We understand travel operations, seasonal demand, booking workflows, and multi-touchpoint journeys.',
        },
        {
          title: 'AI with purpose',
          desc: 'We identify where AI creates real leverage — not where it sounds impressive but adds complexity.',
        },
        {
          title: 'Practical and actionable',
          desc: 'We deliver systems you can implement and manage, not theoretical frameworks.',
        },
      ],
    },
    faq: {
      items: [
        {
          q: 'What kind of AI systems do you build?',
          a: 'We design custom AI agents for support, operations, and customer experiences — as well as intelligent automation workflows that reduce manual effort across the business.',
        },
        {
          q: 'Do you implement the automation or just plan it?',
          a: 'We provide the strategic framework, system design, and implementation direction. We can support execution directly or work with your team and development partners.',
        },
        {
          q: 'Is this relevant for small travel businesses?',
          a: "Yes. Even small teams benefit from targeted automation and smart AI use cases — it doesn't need to be complex to create meaningful operational improvement.",
        },
        {
          q: 'Which tools and platforms do you work with?',
          a: "We're platform-agnostic and recommend the best tools for your specific needs — whether that's CRM automation, AI agent platforms, workflow tools, or custom-built solutions.",
        },
        {
          q: 'How long does a typical engagement take?',
          a: 'Most AI and automation strategy engagements take 4–8 weeks, depending on scope and the number of systems involved.',
        },
      ],
    },
    cta: {
      headline: 'Want your business to run smarter with AI and automation?',
      subtext:
        "Let's design systems that reduce friction and scale with you. Start with a free discovery call and we'll show you where the biggest opportunities are.",
      ctaLabel: 'Book a Free Discovery Call',
    },
  },
  {
    slug: 'performance-marketing',
    title: 'Performance Marketing',
    description:
      'Data-driven campaigns across search, social, and travel platforms — optimised for bookings and ROI.',
    navLinsDesc:
      'Data-driven campaigns across search, social, and travel platforms — optimised for bookings and ROI.',
    icon: 'BarChart3',
    category: 'Marketing & Growth',
    comingSoon: false,
    isPublished: true,
    displayOrder: 5,
    hero: {
      eyebrow: 'Performance Marketing for Travel Businesses',
      headline: 'Build a Paid Growth System, Not Just',
      highlightedText: 'Campaigns',
      description:
        'We turn your ad spend into a predictable growth system, so every dollar works toward generating real leads and bookings.',
      trustLine:
        'Built for travel brands that want paid campaigns to drive real, measurable outcomes.',
    },
    problem: {
      headline: 'Half your ad budget could be wasted without the',
      highlightedText: 'right system.',
      paragraph:
        "Many travel businesses invest in ads but see little return because campaigns lack clear strategy, targeting, and conversion focus. Without a structured approach, clicks don't turn into bookings. In performance marketing, it's not about spending more — it's about making every dollar work.",
      painPoints: [
        { icon: 'Shuffle', text: 'Low return on ad spend' },
        { icon: 'AlertTriangle', text: 'Weak lead quality from campaigns' },
        { icon: 'Eye', text: 'High click costs with poor conversion' },
        {
          icon: 'HelpCircle',
          text: 'Campaigns running without a clear strategy',
        },
      ],
    },
    capabilities: {
      heading: "What's included",
      intro:
        'A strategic performance marketing system designed to generate qualified demand, not just clicks.',
      items: [
        {
          title: 'Paid Acquisition Strategy',
          desc: 'Build a structured plan for paid growth across the right channels and audiences.',
          icon: 'Target',
        },
        {
          title: 'Offer & Campaign Positioning',
          desc: 'Align your offer messaging with what drives action for your ideal traveler.',
          icon: 'Megaphone',
        },
        {
          title: 'Channel Recommendations',
          desc: 'Identify the highest-impact channels — Meta, Google, programmatic, or travel-specific platforms.',
          icon: 'BarChart3',
        },
        {
          title: 'Landing Page Direction',
          desc: 'Design conversion-focused landing experiences that match campaign intent.',
          icon: 'MousePointerClick',
        },
        {
          title: 'Creative & Messaging Guidance',
          desc: 'Develop ad creative direction and messaging angles that resonate and convert.',
          icon: 'Layers',
        },
        {
          title: 'Funnel & Conversion Planning',
          desc: 'Map the post-click journey so leads move from interest to action.',
          icon: 'TrendingUp',
        },
        {
          title: 'Campaign Launch Structure',
          desc: 'Set up campaigns with proper structure, testing, and measurement from day one.',
          icon: 'Zap',
        },
        {
          title: 'Optimization Framework',
          desc: 'Build a repeatable process for reviewing, learning, and improving performance.',
          icon: 'Gauge',
        },
      ],
    },
    process: {
      eyebrow: 'Our Process',
      heading: 'How we build performance campaigns that actually drive growth',
      steps: [
        {
          number: '01',
          title: 'Align',
          desc: 'Offer and audience alignment to ensure campaigns target the right people with the right message.',
        },
        {
          number: '02',
          title: 'Plan',
          desc: 'Campaign structure, channel strategy, and messaging direction built for your goals.',
        },
        {
          number: '03',
          title: 'Launch',
          desc: 'Structured campaign launch with proper creative, targeting, and tracking.',
        },
        {
          number: '04',
          title: 'Optimize',
          desc: 'Performance review, testing, and iterative improvement for sustained results.',
        },
      ],
    },
    deliverables: {
      heading: 'What you get',
      paragraph:
        'A performance marketing system with clear strategy, creative direction, and optimization structure.',
      groups: [
        {
          label: 'Strategy',
          items: [
            'Paid growth strategy',
            'Campaign framework',
            'Channel recommendations',
            'Audience targeting plan',
          ],
        },
        {
          label: 'Creative',
          items: [
            'Messaging angles',
            'Ad creative direction',
            'Landing page direction',
            'Offer positioning',
          ],
        },
        {
          label: 'Execution',
          items: [
            'Campaign structure',
            'Launch plan',
            'Tracking setup guidance',
            'Testing framework',
          ],
        },
        {
          label: 'Optimization',
          items: [
            'Reporting framework',
            'Optimization roadmap',
            'Performance benchmarks',
            'Iteration strategy',
          ],
        },
      ],
    },
    outcomes: {
      heading: 'What this unlocks for your travel business',
      items: [
        {
          title: 'Predictable Pipeline',
          desc: 'Paid campaigns that consistently generate qualified interest and opportunities.',
          icon: 'BarChart3',
        },
        {
          title: 'Better ROI',
          desc: 'Smarter targeting and messaging that reduces waste and increases return.',
          icon: 'TrendingUp',
        },
        {
          title: 'Scalable Acquisition',
          desc: 'A campaign system that can grow with your business, not just burn budget.',
          icon: 'Sparkles',
        },
        {
          title: 'Connected Experience',
          desc: 'Ads, landing pages, and follow-up that feel like one cohesive journey.',
          icon: 'Shield',
        },
      ],
    },
    audience: {
      heading:
        'Built for travel businesses that want paid campaigns to drive real growth',
      tags: [
        'Hotels & resorts',
        'Tour operators',
        'Travel startups',
        'Destination brands',
        'DMCs & agencies',
        'Experience-led hospitality',
      ],
      supportingLine:
        'Ideal for brands ready to invest in paid acquisition with a strategy that supports long-term growth.',
    },
    whyUs: {
      heading: 'Why TripUp Studio',
      paragraph:
        'Most performance agencies optimize metrics. We optimize outcomes — connecting campaign strategy to brand positioning, landing experience, and the full traveler journey.',
      points: [
        {
          title: 'Strategy before spend',
          desc: 'We build the strategic foundation before launching a single ad.',
        },
        {
          title: 'Travel-specific insight',
          desc: 'We understand travel buying cycles, seasonal demand, and what drives bookings.',
        },
        {
          title: 'Full-funnel thinking',
          desc: 'Campaigns are designed to work with your website, content, and follow-up systems.',
        },
        {
          title: 'Transparent and measurable',
          desc: 'Clear reporting, honest assessment, and continuous improvement.',
        },
      ],
    },
    faq: {
      items: [
        {
          q: 'Do you manage ad accounts directly?',
          a: 'We can manage campaigns or provide strategic direction for your team to execute. The engagement is flexible based on your needs.',
        },
        {
          q: 'Which platforms do you work with?',
          a: 'We work across Meta (Facebook/Instagram), Google Ads, and other relevant platforms depending on your audience and goals.',
        },
        {
          q: 'How quickly can campaigns launch?',
          a: 'Most campaigns can be structured and launched within 2–4 weeks after strategy alignment.',
        },
        {
          q: 'Do you also build the landing pages?',
          a: 'Yes. We can design and build conversion-focused landing pages as part of the campaign system.',
        },
        {
          q: 'What budget do we need to start?',
          a: "We'll recommend a budget range based on your goals, market, and competitive landscape. There's no fixed minimum, but we'll be honest about what's realistic.",
        },
      ],
    },
    cta: {
      headline: 'Want paid campaigns that actually support growth?',
      subtext:
        "Let's build a smarter acquisition system. Start with a free discovery call and we'll help you define the right approach for your market.",
      ctaLabel: 'Book a Free Discovery Call',
    },
  },
  {
    slug: 'content-seo',
    title: 'Content & SEO',
    description:
      'Organic reach through destination content, SEO strategy, and authority-building that drives long-term growth.',
    navLinsDesc:
      'Organic reach through destination content, SEO strategy, and authority-building that drives long-term growth.',
    icon: 'Megaphone',
    category: 'Marketing & Growth',
    comingSoon: false,
    isPublished: true,
    displayOrder: 6,
    hero: {
      eyebrow: 'Content & SEO for Travel Businesses',
      headline: 'Be the First Choice When Travelers',
      highlightedText: 'Search',
      description:
        'We create content and SEO systems that help your travel business get discovered by the right audience, build trust over time, and convert search traffic into steady, high-intent bookings.',
      trustLine:
        'Built for travel brands that want organic visibility without depending entirely on paid spend.',
    },
    problem: {
      headline: "If You're Not Showing Up in Search, You're Losing",
      highlightedText: 'Bookings',
      paragraph:
        "Travelers are actively searching for what you offer, but if your business isn't visible, they choose competitors instead. Without strong SEO and content, you miss high-intent demand every day. In search, visibility isn't optional — it's what drives consistent, long-term bookings.",
      painPoints: [
        {
          icon: 'Eye',
          text: 'Low search visibility in competitive travel categories',
        },
        { icon: 'Shuffle', text: 'Weak or inconsistent content direction' },
        {
          icon: 'AlertTriangle',
          text: "Content that looks active but doesn't support discovery",
        },
        {
          icon: 'Target',
          text: 'Ranking for the wrong topics or low-intent terms',
        },
        { icon: 'HelpCircle', text: 'No clear authority-building strategy' },
        {
          icon: 'Search',
          text: 'SEO efforts disconnected from real content systems',
        },
      ],
    },
    capabilities: {
      heading: "What's included",
      intro:
        'A strategic content and SEO engagement designed to build sustainable organic visibility and authority for your travel brand.',
      items: [
        {
          title: 'Organic Growth Analysis',
          desc: 'Assess your current visibility and identify the highest-impact content and SEO opportunities.',
          icon: 'BarChart3',
        },
        {
          title: 'Search Intent Mapping',
          desc: 'Map keywords and topics to traveler intent so your content matches what people actually search for.',
          icon: 'Target',
        },
        {
          title: 'Content Strategy Direction',
          desc: 'Define a clear content direction aligned with your brand, audience, and growth goals.',
          icon: 'PenTool',
        },
        {
          title: 'Destination & Discovery Content',
          desc: 'Plan destination-led and editorial content that drives organic discovery and builds trust.',
          icon: 'Globe',
        },
        {
          title: 'Content Cluster Planning',
          desc: 'Build topic clusters that establish authority and capture related search traffic over time.',
          icon: 'Layers',
        },
        {
          title: 'Core Page SEO',
          desc: 'Optimize your most important pages for the right terms, intent, and search structure.',
          icon: 'FileText',
        },
        {
          title: 'Authority-Building Direction',
          desc: 'Develop a strategy for building topical authority through consistent, useful content.',
          icon: 'BookOpen',
        },
        {
          title: 'Organic Growth Roadmap',
          desc: 'A long-term plan for building and sustaining content-driven organic visibility.',
          icon: 'TrendingUp',
        },
      ],
    },
    process: {
      eyebrow: 'Our Process',
      heading: 'How we build content and SEO systems that compound',
      steps: [
        {
          number: '01',
          title: 'Audit',
          desc: 'Visibility and content audit to understand your current organic performance and gaps.',
        },
        {
          number: '02',
          title: 'Map',
          desc: 'Search intent and traveler journey analysis to identify the right topics and opportunities.',
        },
        {
          number: '03',
          title: 'Plan',
          desc: 'Content system and SEO structure planning with prioritization of pages, clusters, and themes.',
        },
        {
          number: '04',
          title: 'Build',
          desc: 'Optimization direction and long-term roadmap for sustained organic growth.',
        },
      ],
    },
    deliverables: {
      heading: 'What you get',
      paragraph:
        'A structured content and SEO strategy with clear priorities, content direction, and a roadmap for long-term organic growth.',
      groups: [
        {
          label: 'Audit',
          items: [
            'Organic opportunity audit',
            'Competitive visibility analysis',
            'Content performance baseline',
            'Technical SEO review',
          ],
        },
        {
          label: 'Strategy',
          items: [
            'Search intent and topic map',
            'Content strategy direction',
            'Destination & editorial recommendations',
            'Content cluster framework',
          ],
        },
        {
          label: 'Optimization',
          items: [
            'Page-level SEO priorities',
            'On-page optimization direction',
            'Internal linking strategy',
            'Authority-building roadmap',
          ],
        },
        {
          label: 'Growth',
          items: [
            'Long-term content & SEO growth plan',
            'Content ecosystem planning',
            'Performance tracking framework',
            'Quarterly priority plan',
          ],
        },
      ],
    },
    outcomes: {
      heading: 'What this unlocks for your travel business',
      items: [
        {
          title: 'Better Discoverability',
          desc: 'Show up when travelers are searching, comparing, and exploring destinations.',
          icon: 'Search',
        },
        {
          title: 'Stronger Trust',
          desc: 'Build authority and credibility through useful, well-positioned content.',
          icon: 'Shield',
        },
        {
          title: 'Relevant Traffic',
          desc: 'Attract higher-intent visitors who are actively looking for what you offer.',
          icon: 'Target',
        },
        {
          title: 'Compounding Growth',
          desc: 'A content engine that reduces dependency on paid channels and grows over time.',
          icon: 'Sparkles',
        },
      ],
    },
    audience: {
      heading:
        'Built for travel businesses that want content and SEO to work as a real growth channel',
      tags: [
        'Hotels & resorts',
        'Tour operators',
        'Travel startups',
        'Destination brands',
        'DMCs & agencies',
        'Experience-led hospitality',
      ],
      supportingLine:
        'Ideal for brands that want to reduce overdependence on paid acquisition and build lasting organic visibility through strategic content.',
    },
    whyUs: {
      heading: 'Why TripUp Studio',
      paragraph:
        'Most providers treat content and SEO as separate disciplines. We integrate them — connecting search visibility to the content, pages, and user experiences that actually drive growth.',
      points: [
        {
          title: 'Content + SEO, integrated',
          desc: 'We build systems where content strategy and SEO structure work together, not in silos.',
        },
        {
          title: 'Travel-specific knowledge',
          desc: 'We understand destination search behavior, seasonal patterns, and travel content strategy.',
        },
        {
          title: 'Authority-first approach',
          desc: 'We focus on building topical authority, not chasing keyword volume.',
        },
        {
          title: 'Long-term focus',
          desc: 'We build for compounding visibility through strategic content, not quick-fix tactics.',
        },
      ],
    },
    faq: {
      items: [
        {
          q: 'Is this just an SEO service?',
          a: 'No. This is a combined content and SEO engagement. We build the content strategy and SEO structure together so they reinforce each other and drive sustainable organic growth.',
        },
        {
          q: 'Do you create the content too?',
          a: 'We provide content strategy, topic direction, and editorial planning. For full content production, we work with your team or trusted content partners.',
        },
        {
          q: 'How long does it take to see results?',
          a: 'Content and SEO are long-term investments. Most travel brands start seeing meaningful improvement within 3–6 months, with compounding results over time.',
        },
        {
          q: 'Is this a one-time engagement or ongoing?',
          a: 'We offer both. A strategic foundation engagement gives you the roadmap, and ongoing support helps with execution and optimization.',
        },
        {
          q: 'Can you work with our existing content and website?',
          a: 'Yes. We audit what you have, identify gaps and opportunities, and build a strategy that works with your current setup.',
        },
      ],
    },
    cta: {
      headline:
        'Want content and SEO to work together as a real growth channel?',
      subtext:
        "Let's build a smarter organic visibility system. Start with a free discovery call and we'll show you where the opportunities are.",
      ctaLabel: 'Book a Free Discovery Call',
    },
  },
  {
    slug: 'social-media',
    title: 'Social Media Management',
    description:
      'Strategy, content calendars, and community management that grow your travel brand across social platforms.',
    navLinsDesc:
      'Strategy, content calendars, and community management that grow your travel brand across social platforms.',
    icon: 'Share2',
    category: 'Marketing & Growth',
    comingSoon: false,
    isPublished: true,
    displayOrder: 7,
    hero: {
      eyebrow: 'Social Media Management for Travel Businesses',
      headline: 'Turn Social Media Into Consistent',
      highlightedText: 'Bookings',
      description:
        'We manage your content, messaging, and growth strategy to attract the right audience and convert attention into real inquiries and bookings.',
      trustLine:
        "Posting regularly isn't enough. Without strategy and consistency, social media won't drive real results.",
    },
    problem: {
      headline: "Being active isn't the same as being",
      highlightedText: 'effective',
      paragraph:
        "Many travel businesses stay active online but struggle to turn attention into real results. Without clear strategy, consistent messaging, and audience focus, engagement doesn't translate into inquiries. Social media should do more than look good — it should build trust and drive actual bookings.",
      painPoints: [
        {
          icon: 'Shuffle',
          text: 'Inconsistent posting without measurable business impact',
        },
        { icon: 'Eye', text: 'Weak or disconnected visual brand presence' },
        {
          icon: 'AlertTriangle',
          text: 'Low engagement despite regular effort',
        },
        {
          icon: 'HelpCircle',
          text: 'No clear strategy behind content or offers',
        },
        {
          icon: 'MessageCircle',
          text: 'Difficulty turning followers into inquiries or bookings',
        },
        {
          icon: 'Megaphone',
          text: 'Social media that feels busy but not effective',
        },
      ],
    },
    capabilities: {
      heading: 'What’s Included in Social Media Management',
      intro:
        'A complete social media management system built for travel brands — from strategy and content planning to execution and performance review.',
      items: [
        {
          title: 'Social Strategy & Positioning',
          desc: 'Define what your brand should communicate across social platforms so your presence feels clear, intentional, and aligned with your business goals.',
          icon: 'Target',
        },
        {
          title: 'Content Planning & Campaign Direction',
          desc: 'Build structured content plans around your offers, seasonality, campaigns, and customer journey so every post supports a purpose.',
          icon: 'CalendarDays',
        },
        {
          title: 'Visual Consistency & Brand Presentation',
          desc: 'Make sure your feed looks cohesive, premium, and instantly more credible.',
          icon: 'Palette',
        },
        {
          title: 'Caption & Messaging Development',
          desc: 'Create content messaging that communicates value, creates emotional pull, and encourages action.',
          icon: 'PenTool',
        },
        {
          title: 'Publishing & Ongoing Management',
          desc: 'Manage the execution side so your brand stays active, organized, and consistent across the right channels.',
          icon: 'Clock',
        },
        {
          title: 'Performance Review & Optimization',
          desc: "Review what's working, what's underperforming, and where to improve so your social media gets stronger over time.",
          icon: 'BarChart3',
        },
      ],
    },
    process: {
      eyebrow: 'Our Process',
      heading: 'How Our Social Media Management Works',
      steps: [
        {
          number: '01',
          title: 'Audit & Strategy',
          desc: 'Review your current social presence, identify gaps, and define the right strategic direction based on your audience, offers, and business goals.',
        },
        {
          number: '02',
          title: 'Content Planning & Creative Direction',
          desc: 'Build a structured monthly content plan with clear themes, campaigns, messaging direction, and visual consistency.',
        },
        {
          number: '03',
          title: 'Publishing & Ongoing Management',
          desc: 'Manage scheduling, publishing, and ongoing execution so your channels stay active, organized, and aligned.',
        },
        {
          number: '04',
          title: 'Performance Review & Optimization',
          desc: 'Analyze content performance, engagement trends, and audience response, then refine the strategy for stronger results over time.',
        },
      ],
    },
    deliverables: {
      heading: 'Why Social Media Matters More in Travel',
      paragraph:
        'Travel is emotional, visual, and trust-driven. Before someone books, they often check your social media to answer silent questions: Does this experience feel worth it? Can I trust them with my trip? If your social presence can’t answer those questions clearly, you lose attention before the sales conversation even starts.',
      groups: [
        {
          label: 'Trust & Credibility',
          items: [
            'Build credibility faster',
            'Strengthen brand perception',
            'Support paid campaigns and website conversions',
          ],
        },
        {
          label: 'Growth & Results',
          items: [
            'Stay top of mind',
            'Generate better quality inquiries over time',
            'Turn attention into real demand',
          ],
        },
      ],
    },
    outcomes: {
      heading: 'What You Can Expect',
      items: [
        {
          title: 'Stronger Brand Presence',
          desc: 'A more trustworthy and professional brand presence across social platforms.',
          icon: 'Shield',
        },
        {
          title: 'Better Consistency',
          desc: 'More aligned content around offers, campaigns, and brand messaging.',
          icon: 'Share2',
        },
        {
          title: 'Stronger Engagement',
          desc: 'Higher quality interactions and audience response over time.',
          icon: 'Heart',
        },
        {
          title: 'Growth That Converts',
          desc: 'A social presence that supports sales, inquiries, and long-term growth.',
          icon: 'TrendingUp',
        },
      ],
    },
    audience: {
      heading: 'This Service Is Best For',
      tags: [
        'Hotels & resorts',
        'Tour operators',
        'Travel agencies',
        'DMCs',
        'Visa & holiday service brands',
        'Luxury & niche travel brands',
        'New travel brands needing a polished presence',
        'Established brands wanting social to support real growth',
      ],
      supportingLine: null,
    },
    whyUs: {
      heading: 'Why TripUp Studio',
      paragraph:
        'Most agencies treat social media as a content task. We treat it as a growth system. TripUp Studio combines travel market understanding, brand strategy, messaging psychology, and execution discipline to build social media systems that help travel brands communicate better, and convert attention into demand. We help you make social media actually matter.',
      points: [
        {
          title: 'Growth-first approach',
          desc: 'Every piece of content is connected to your business goals, not just engagement metrics.',
        },
        {
          title: 'Built for travel',
          desc: 'We understand how travelers discover, evaluate, and decide — and we design social strategies around that.',
        },
        {
          title: 'Brand consistency at scale',
          desc: 'We ensure your visual identity, messaging, and tone stay aligned across every platform.',
        },
        {
          title: 'Strategy + execution',
          desc: 'We don’t just plan — we manage, publish, review, and improve every cycle.',
        },
      ],
    },
    faq: {
      items: [
        {
          q: 'Which platforms do you manage?',
          a: 'We typically manage Instagram, Facebook, and LinkedIn for travel brands. We can also support TikTok or other platforms depending on your audience and goals.',
        },
        {
          q: 'Do you create the content too?',
          a: 'We provide content direction, caption writing, and visual structure. For photography or video production, we work with your existing assets or coordinate with content partners.',
        },
        {
          q: 'How often do you post?',
          a: 'Posting frequency depends on the plan and platform, but most clients see 12–20 posts per month across channels, supported by stories and engagement management.',
        },
        {
          q: 'Can you run paid ads too?',
          a: 'Social media management focuses on organic presence. For paid campaigns, we offer Performance Marketing as a separate or combined service.',
        },
        {
          q: 'How do you measure results?',
          a: 'We track reach, engagement, follower quality, inquiry volume, and content performance — and review everything monthly to refine the strategy.',
        },
      ],
    },
    cta: {
      headline: 'Ready to Make Social Media Work for Your Travel Brand?',
      subtext:
        "If your social presence feels inconsistent, underperforming, or disconnected from real growth, we'll help turn it into a stronger trust and demand channel.",
      ctaLabel: 'Book a Free Growth Call',
    },
  },
] satisfies Array<
  Omit<Prisma.TravelServiceCreateInput, 'serviceCategory' | 'travelInsights'>
>;

async function upsertServiceCategories() {
  const categories = new Map<string, string>();

  for (const category of serviceCategories) {
    const data = await prisma.serviceCategory.upsert({
      where: {
        name: category.name,
      },
      update: {},
      create: category,
    });

    categories.set(data.name, data.id);
  }

  return categories;
}

async function seedTravelServices(categoryIds: Map<string, string>) {
  for (const service of travelServices) {
    const serviceCategoryId = categoryIds.get(service.category ?? '');

    if (!serviceCategoryId) {
      throw new Error(`Missing service category for "${service.title}"`);
    }

    await prisma.travelService.upsert({
      where: {
        slug: service.slug,
      },
      update: {
        ...service,
        serviceCategory: {
          connect: {
            id: serviceCategoryId,
          },
        },
      },
      create: {
        ...service,
        serviceCategory: {
          connect: {
            id: serviceCategoryId,
          },
        },
      },
    });
  }
}

async function main() {
  const categoryIds = await upsertServiceCategories();
  await seedTravelServices(categoryIds);
}

main()
  .then(async () => {
    console.log('Travel service seed completed.');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
