# Maison Aurelle

**Live:** <!-- TODO: production URL paste karo yahan -->

Maison Aurelle is a Pakistani fashion boutique — cream-and-gold pieces with the quiet confidence of restrained luxury. This repository is its storefront.

The recommendation system here is the thing I'm proud of. Most stores either show whatever the default algorithm picks, or wire up some heavyweight ML service that doesn't really know the catalogue. I wrote a small hybrid engine that does three things: watches what a shopper does over their last month of visits, finds patterns in their own behaviour, and pairs that with similarity and co-purchase signals from real order history. No external service, no black box. You can read the code and predict what it will recommend.

Search works the same way. It expands synonyms — wedding becomes bridal, lawn becomes summer cotton — and tolerates typos. Results are ranked by where the match came from: a hit in the product name counts for more than a hit deep in the description.

The admin dashboard surfaces what actually matters when you are running a shop: what sold today, which sizes are running thin, who came back this week, which products people viewed but did not buy.

Built on Next.js 15 with the App Router, Prisma over SQLite in development and Postgres in production, sessions in signed JWT cookies via `jose`. The design system runs on Cormorant Garamond for headlines, Inter for body, and Italianno saved for moments that earn it. Tailwind for layout, Framer Motion for the choreography between sections.

License: MIT.
