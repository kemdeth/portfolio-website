-- ================================================================
-- Seed Data – Run this ONCE after creating the tables
-- ================================================================
-- Paste this into Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: uses ON CONFLICT to avoid duplicates.
-- ================================================================

-- 1. Profile (singleton – JSONB) ------------------------------------

insert into public.site_profile (id, data, updated_at)
values (1, '{
  "name": "Kem Deth",
  "headline": "Frontend Developer",
  "location": "Phnom Penh, Cambodia",
  "email": "kemdeth25@gmail.com",
  "resumeUrl": "/cv/KemDethLive.pdf",
  "avatarUrl": "/image/KemDeth.png",
  "aboutPhotoUrl": "/image/kemdeth_about_me-removebg-preview.png",
  "github": "https://github.com/kemdeth",
  "linkedin": "https://linkedin.com/in/kemdeth",
  "telegram": "https://t.me/KEMDETH",
  "intro": [
    "I'\''m an enthusiastic Frontend Developer with a passion for creating responsive, user-friendly websites. Currently pursuing my Computer Science degree at the Royal University of Phnom Penh, I build real projects every day to sharpen my craft.",
    "My approach blends technical precision with creative instinct. I love the moment a design clicks into place in the browser — clean, fast, and accessible to everyone.",
    "I'\''m actively looking for entry-level roles and internships where I can contribute meaningfully and grow alongside a great team."
  ],
  "typingPhrases": [
    "Frontend Developer",
    "Building Warm, Creative UIs",
    "JavaScript Enthusiast",
    "Mobile-First Mindset",
    "Open to Opportunities"
  ],
  "heroStats": [
    { "value": "2+", "label": "Years Coding" },
    { "value": "3",  "label": "Projects Built" },
    { "value": "600+", "label": "Hours Learned" }
  ],
  "education": [
    {
      "school": "Royal University of Phnom Penh",
      "degree": "Bachelor'\''s Degree in Computer Science",
      "dates": "2024 — Present"
    }
  ],
  "softSkills": [
    "Communication",
    "Teamwork",
    "Time Management",
    "Problem Solving",
    "Quick Learner",
    "Adaptability"
  ],
  "availability": "Open to opportunities",
  "responseTime": "Within 24 hours"
}'::jsonb, now())
on conflict (id) do update set data = excluded.data, updated_at = now();


-- 2. Skills ---------------------------------------------------------

insert into public.skills (id, category, name, level, sort_order) values
  ('s-01', 'Frontend Core',   'HTML5',                     90, 1),
  ('s-02', 'Frontend Core',   'CSS3',                      85, 2),
  ('s-03', 'Frontend Core',   'JavaScript (ES6+)',         75, 3),
  ('s-04', 'Frontend Core',   'TypeScript',                70, 4),
  ('s-05', 'Frontend Core',   'React',                     75, 5),
  ('s-06', 'Frontend Core',   'Tailwind CSS',              80, 6),
  ('s-07', 'Frontend Core',   'Bootstrap 5',               72, 7),
  ('s-08', 'Frontend Core',   'Responsive / Mobile-First', 88, 8),
  ('s-09', 'Tools & Workflow','Git & GitHub',              80, 9),
  ('s-10', 'Tools & Workflow','VS Code',                   92, 10),
  ('s-11', 'Tools & Workflow','Browser DevTools',          78, 11),
  ('s-12', 'Tools & Workflow','Figma (basics)',            60, 12),
  ('s-13', 'Tools & Workflow','PHP',                       72, 13),
  ('s-14', 'Tools & Workflow','Laravel (basics)',          60, 14),
  ('s-15', 'Other Skills',    'Prompt Engineering',        90, 15),
  ('s-16', 'Other Skills',    'Web Accessibility (a11y)',  70, 16),
  ('s-17', 'Other Skills',    'Web Testing',               70, 17),
  ('s-18', 'Other Skills',    'Problem Solving',           80, 18)
on conflict (id) do update set
  category = excluded.category,
  name = excluded.name,
  level = excluded.level,
  sort_order = excluded.sort_order,
  updated_at = now();


-- 3. Projects -------------------------------------------------------

insert into public.projects (id, title, description, challenge, tags, image, live_url, source_url, featured, status, sort_order) values
(
  'p-01',
  'Personal Portfolio Website',
  'A fully custom dark-mode frontend built with pure HTML, CSS & JavaScript. Features smooth scroll-reveal animations, a serverless Telegram contact form, dark/light theme toggle, and a 95+ Lighthouse score.',
  'Secured the contact form by moving the Telegram bot token server-side — zero secrets exposed in the frontend.',
  '{HTML5,CSS3,JavaScript,Netlify,Serverless}',
  '/ProjectImage/portfolio.png',
  'https://kem-deth.netlify.app',
  'https://github.com/kemdeth/portfolio-website',
  true, 'Live', 1
),
(
  'p-02',
  'E-Commerce Storefront',
  'A responsive mock storefront with product listings, a dynamic cart, and smooth CSS animations — zero frameworks used.',
  'Real-time cart with add/remove & price recalculation using pure DOM manipulation.',
  '{HTML,Bootstrap 5,JavaScript,CSS Animations}',
  '/ProjectImage/E-Commerce Storefront.png',
  'https://e-commerce-fronstore.netlify.app/',
  'https://github.com/kemdeth/E-Commerce-Storefront',
  true, 'Live', 2
),
(
  'p-03',
  'Ask Kem — AI Portfolio Assistant',
  'A Gemini-powered chat assistant embedded in this portfolio. Visitors can ask about my skills, projects, and availability — getting instant answers 24/7 without leaving the page.',
  'Gemini API key kept server-side via Netlify Function — zero secrets in the browser. Conversation history managed client-side for smooth multi-turn chat.',
  '{HTML,CSS,JavaScript,Node.js,Gemini AI,Netlify}',
  '/ProjectImage/Kem''s assistant.png',
  'https://ask-kem-bot.netlify.app',
  'https://github.com/kemdeth/ask-kem-bot',
  true, 'Live', 3
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  challenge = excluded.challenge,
  tags = excluded.tags,
  image = excluded.image,
  live_url = excluded.live_url,
  source_url = excluded.source_url,
  featured = excluded.featured,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();


-- 4. Certificates ---------------------------------------------------

insert into public.certificates (id, name, issuer, year, sort_order) values
  ('c-01', 'Responsive Web Design',   'freeCodeCamp', '2024', 1),
  ('c-02', 'JavaScript Algorithms',   'freeCodeCamp', '2024', 2),
  ('c-03', 'Web Development Bootcamp','Udemy',        '2024', 3),
  ('c-04', 'Git & GitHub Essentials', 'Coursera',     '2024', 4)
on conflict (id) do update set
  name = excluded.name,
  issuer = excluded.issuer,
  year = excluded.year,
  sort_order = excluded.sort_order,
  updated_at = now();


-- 5. Testimonials ---------------------------------------------------

insert into public.testimonials (id, name, role, quote, avatar, rating, sort_order) values
(
  't-01',
  'Dr. Sokha Chan',
  'CS Professor, RUPP',
  'Kem demonstrated exceptional problem-solving skills and dedication. His frontend projects showed creativity and real attention to detail — impressive for a first-year student.',
  '/testimonials/images/Dr. Sokha Chan.png',
  5, 1
),
(
  't-02',
  'Sophea Nguon',
  'Classmate & Project Partner',
  'Working with Kem on our group project was great. He''s a strong communicator and always willing to help team members through complex concepts patiently.',
  '/testimonials/images/Sophea Nguon.jpg',
  5, 2
),
(
  't-03',
  'Raksa Pov',
  'Study Group Leader',
  'Kem''s ability to quickly learn and implement new technologies is impressive. His responsive design skills stand out — clean code, easy to read and maintain.',
  '/testimonials/images/Raksa Pov.png',
  5, 3
)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  quote = excluded.quote,
  avatar = excluded.avatar,
  rating = excluded.rating,
  sort_order = excluded.sort_order,
  updated_at = now();


-- 6. Sample messages (optional) -------------------------------------

insert into public.messages (id, name, email, subject, body, read, created_at) values
  ('m-01', 'TechHR Solutions', 'hello@techhr.example', 'Junior Frontend Role',
   'Hi Kem, we saw your portfolio and would love to chat about a junior frontend position. Are you available for a call this week?',
   false, '2026-07-28T09:15:00.000Z'),
  ('m-02', 'Nara Mey', 'nara.mey@example.com', 'Freelance inquiry',
   'I need a small landing page for my coffee shop. Can you help? Here is my phone number, please reach out.',
   true, '2026-08-02T14:40:00.000Z')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  subject = excluded.subject,
  body = excluded.body,
  read = excluded.read,
  created_at = excluded.created_at;
