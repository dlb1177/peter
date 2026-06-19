/**
 * Default content for the editable Faith Formation pages.
 *
 * This is the content each page shows out of the box (it mirrors the original
 * static pages). It is used when a page has not yet been edited in /admin/ (or
 * before Firebase is configured), and it pre-fills the admin editor so staff
 * start from the current page rather than a blank one. Once a page is saved in
 * the admin, the Firebase copy takes over.
 *
 * Shape per page: { title, eyebrow, intro, heroVariant, blocks: [...] }.
 * See js/faith-pages.js for the supported block types.
 */
export const FAITH_DEFAULTS = {
  'catechesis-good-shepherd': {
    title: 'Catechesis of the Good Shepherd',
    eyebrow: 'Faith Formation · Children (Ages 3–12)',
    intro: "An approach to children's faith formation rooted in Liturgy and Sacred Scripture, where the youngest members of our parish encounter Christ the Good Shepherd and grow in a living relationship with God.",
    heroVariant: 'light',
    blocks: [
      { type: 'heading', text: 'About the Catechesis' },
      { type: 'text', body: "The Catechesis of the Good Shepherd (CGS) was founded by Sofia Cavalletti and Gianna Gobbi in 1954 in Rome, Italy and is an approach to faith formation for children ages 3 to 12 inspired by Montessori Principles of Education. The basis of this formation is Liturgy and Sacred Scripture.\n\nCGS is based on the conviction that God and the child are already in relationship. The child has a deep need to experience and a special capacity to enjoy the presence of God. The task of the adult is to help the child live fully the encounter with God. This experience becomes formative in the child's whole person and generates great joy. The atrium is the environment where this formation takes place. It is one of the elements that help the relationship between God and the child to flourish.\n\nCGS divests itself of any strictly scholastic character, so as to become an experience of life, and education in faith, and a celebration of the encounter with the Father, in listening to Jesus, the one Teacher, and in obedience to the Holy Spirit." },
      { type: 'button', label: 'Visit National Association (cgsusa.org)', url: 'http://www.cgsusa.org', style: 'outline' },
      { type: 'button', label: 'Watch CGS Overview Video', url: 'https://www.youtube.com/watch?v=hfg9RfBk-fY', style: 'outline' },
      { type: 'links', title: 'CGS Newsletters', items: [
        { label: 'November/December Newsletter', url: 'https://irp.cdn-website.com/51d19b9a/files/uploaded/Nov-Dec_CGS_Newsletter.pdf' }
      ] },
      { type: 'links', title: 'CGS Parent Pages', items: [
        { label: 'Parables', url: 'https://irp.cdn-website.com/51d19b9a/files/uploaded/All-About-the-Atrium_Parables_In-The-Home_%281%29.pdf' },
        { label: 'Tabernacle and the Word', url: 'https://irp.cdn-website.com/51d19b9a/files/uploaded/PP-Tabernacle-and-the-Word-October-2022-edkm.pdf' },
        { label: 'Gestures of the Mass', url: 'https://irp.cdn-website.com/51d19b9a/files/uploaded/PP-Gestures.pdf' },
        { label: 'The Good Shepherd Parable', url: 'https://irp.cdn-website.com/51d19b9a/files/uploaded/The_Good_Shepherd_Parable.pdf' },
        { label: 'The Moral Life & Elementary Child', url: 'https://irp.cdn-website.com/51d19b9a/files/uploaded/The_Moral_Life_and_the_Elementary_Child.pdf' },
        { label: 'The Mustard Seed', url: 'https://irp.cdn-website.com/51d19b9a/files/uploaded/The_Mustard_Seed.pdf' },
        { label: 'The Holy Spirit & Elementary Child', url: 'https://irp.cdn-website.com/51d19b9a/files/uploaded/The_Holy_Spirit_and_the_Elementary_Child.pdf' }
      ] },
      { type: 'heading', text: '2025-2026 CGS Atria Schedule' },
      { type: 'cards', items: [
        { title: 'Level 1', subtitle: 'Ages 3 - Kindergarten', body: "- Wed: 5:30pm - 7:00pm\n- Fri: 9:00am - 10:30am\n\nThe 3-6 year old child is particularly capable of receiving and enjoying the most essential elements of our faith—the announcement of God's love especially experienced through Jesus the Good Shepherd, who died and is risen. The work of the atrium is centered around scripture and liturgy. The children receive presentations about the person of Jesus, His Kingdom and their life with Him through liturgy.", linkLabel: '', linkUrl: '' },
        { title: 'Level 2', subtitle: 'Grades 1 - 3', body: "- Wed: 5:30pm - 7:00pm\n\nWhile the heart of the child under six revolves around the Parable of the Good Shepherd, the elementary aged child is captured by the image of the True Vine. This proclamation responds to the deep need of the elementary child to better know his/her relationship with God, family, friends and the larger community. The child at this age seeks guidelines. Moral parables offer a model for comparing their behavior with that of those in these parables.", linkLabel: '', linkUrl: '' },
        { title: 'Level 3', subtitle: 'Grade 4', body: "- Wed: 5:30pm - 7:00pm", linkLabel: '', linkUrl: '' }
      ] },
      { type: 'callout', title: 'Sacrament Preparation', body: "Preparation for First Reconciliation and First Holy Communion is a two-year process and happens in the Level 2 atrium. Many families desire for their child to receive first sacraments in second grade and so students may start preparing for them in first grade.\n\nThe parish encourages families to start their children's faith journey in the preschool (Level 1) atrium and continue that journey through the Level 2 atrium so that the children are able to absorb the work according to different development stages for the 3-6 year old versus the 6-9 year old.", style: 'gold', linkLabel: '', linkUrl: '' },
      { type: 'contact', name: 'Bridgette Adler', role: 'Catechesis of the Good Shepherd Coordinator', email: 'badler@stpetersmendota.org', phone: '651-905-4313', note: 'For more information regarding CGS contact:' },
      { type: 'links', title: 'Explore More', items: [
        { label: 'Youth Formation', url: 'youth-formation.html' },
        { label: 'Adult Formation', url: 'adult-formation.html' },
        { label: 'Sacraments', url: 'sacraments.html' }
      ] }
    ]
  },

  'youth-formation': {
    title: 'Youth Formation',
    eyebrow: 'Faith Formation · Grades 5–12',
    intro: 'Our middle school and high school ministries walk with young people as they encounter Christ, grow in friendship with Him and one another, and prepare for the sacraments.',
    heroVariant: 'light',
    blocks: [
      { type: 'quote', text: '"I have come that they may have life and have it abundantly."', attribution: '- Jesus (in John 10:10)' },
      { type: 'cards', items: [
        { title: 'ZOI', subtitle: 'Greek for "Life" · Grades 5-8', body: 'At Zoi Middle Schoolers learn more about the living and effective word of God in small groups facilitated by a small group mentor. Through YDisciple our pre-teens dive into the Sunday scripture.', linkLabel: '', linkUrl: '' },
        { title: 'PERISSOS', subtitle: 'Greek for "Abundantly" · Grades 9-12', body: 'Perissos is our high school group focused on encountering Christ. All high school youth are welcome to join us each Wednesday from 7:00-8:30pm (September-May) as we dive deeper into relationship with Christ, His Church, and one another.\n\nAll are welcome! Most folks fall into one of three categories:\n\n- **Perissos Participant:** This person, who comes from time to time, may or may not be Confirmed and are not preparing for Confirmation.\n- **Confirmation Preparation:** High school youth are welcome to prepare for Confirmation any of their four years of high school and full and active participation is a key part of Confirmation prep.\n- **Cornerstone:** Cornerstone is the name of our "next level" small groups for Confirmed upperclassmen to dive deeper in their relationship with the Lord. In addition to Perissos on Wednesdays, those who participate in Cornerstone participate in an annual retreat.', linkLabel: '', linkUrl: '' }
      ] },
      { type: 'contact', name: 'Elizabeth McCanna', role: 'Director of Evangelization', email: 'emccanna@stpetersmendota.org', phone: '651-905-4312', note: 'For more information regarding Zoi & Perissos contact:' },
      { type: 'links', title: 'Explore More', items: [
        { label: 'Catechesis of the Good Shepherd', url: 'catechesis-good-shepherd.html' },
        { label: 'Adult Formation', url: 'adult-formation.html' },
        { label: 'Confirmation', url: 'sacrament-confirmation.html' }
      ] }
    ]
  },

  'adult-formation': {
    title: 'Adult Formation',
    eyebrow: 'Faith Formation · Adults',
    intro: 'Faith is a lifelong journey. Whether you are exploring Christianity for the first time or seeking to go deeper, our parish offers many ways for adults to grow in relationship with Christ and one another.',
    heroVariant: 'light',
    blocks: [
      { type: 'text', body: "To walk with adults on their faith journey, St. Peter's offers a variety of opportunities to learn, pray, and build community. Explore the pathways below to find a place to grow." },
      { type: 'cards', items: [
        { title: 'Small Groups', subtitle: '', body: "Bible studies, men's and women's groups, prayer cenacles, and more. Small groups provide intimate settings where you can ask questions, share experiences, and support one another on your faith journey.", linkLabel: 'Explore Small Groups', linkUrl: 'small-groups.html' },
        { title: 'Faith Enrichment Resources', subtitle: '', body: 'Trusted books, talks, podcasts, and online tools to deepen your understanding of the faith and nourish your prayer life—at your own pace, wherever you are.', linkLabel: 'Browse Resources', linkUrl: 'faith-enrichment.html' }
      ] },
      { type: 'callout', title: 'Explore Life, Faith, Meaning', body: 'Alpha is a place to explore the basics of the Christian faith and build relationships. Each week, we share **dinner**, watch a **video presentation**, and have a **small group discussion**. It is open, informal, and honest. No pressure. No charge. All are welcome!', style: 'red', linkLabel: 'Learn More About Alpha', linkUrl: 'alpha.html' },
      { type: 'contact', name: 'Elizabeth McCanna', role: 'Director of Evangelization', email: 'emccanna@stpetersmendota.org', phone: '651-905-4312', note: 'For more information regarding Adult Formation please contact:' },
      { type: 'links', title: 'Explore More', items: [
        { label: 'Catechesis of the Good Shepherd', url: 'catechesis-good-shepherd.html' },
        { label: 'Youth Formation', url: 'youth-formation.html' },
        { label: 'Sacraments', url: 'sacraments.html' }
      ] }
    ]
  },

  'small-groups': {
    title: "Small Groups at St. Peter's",
    eyebrow: '',
    intro: 'Join a community of faith where you can grow spiritually, build meaningful relationships, and deepen your connection to Christ.',
    heroVariant: 'light',
    blocks: [
      { type: 'text', body: "At St. Peter's, we believe in the power of small faith communities. Whether you're seeking deeper spiritual formation, Bible study, fellowship, or prayer, there's a group for you. Small groups provide intimate settings where you can ask questions, share experiences, and support one another on your faith journey." },
      { type: 'cards', items: [
        { title: 'Alpha', subtitle: 'Flexible Schedule', body: 'A place to explore the basics of the Christian faith and build relationships. Each week features dinner, a video presentation, and small group discussion—informal, honest, and welcoming to all.', linkLabel: 'Learn More', linkUrl: 'alpha.html' },
        { title: "Women's Bible Study", subtitle: 'Tuesdays 10am & Mondays 6:30pm', body: "Join women at all stages of their faith journey to study Scripture together. Two convenient times allow you to choose what works best for your schedule. Deepen your understanding of God's word in community.", linkLabel: '', linkUrl: '' },
        { title: "Men's Fellowship", subtitle: 'Call for Schedule', body: 'A gathering for men to build brotherhood, share faith experiences, and support one another. This group provides opportunities for spiritual growth and meaningful connections with other men in the parish.', linkLabel: '', linkUrl: '' },
        { title: 'Divine Mercy Cenacle', subtitle: 'Sundays 12pm', body: "A prayer group dedicated to Our Lady's request for a Cenacle of prayer. Join us for devotion, rosary, and intercession. This group provides a peaceful space for Marian devotion and intercessory prayer.", linkLabel: '', linkUrl: '' },
        { title: 'Rosary Makers', subtitle: 'Tuesdays 7pm', body: 'A group of parishioners who gather to make rosaries together, combining craftsmanship with prayer. Your handmade rosaries help spread devotion throughout the parish and beyond.', linkLabel: '', linkUrl: '' },
        { title: 'Cornerstone', subtitle: 'Confirmed High Schoolers', body: 'Our "next level" small groups for confirmed upperclassmen to dive deeper in their relationship with the Lord. In addition to Perissos on Wednesdays, participants enjoy annual retreats and deeper formation.', linkLabel: '', linkUrl: '' },
        { title: 'ZOI & PERISSOS', subtitle: 'Grades 5-12', body: 'Our youth groups focused on encountering Christ. ZOI serves grades 5-8 with YDisciple small group formation. PERISSOS welcomes all high school youth on Wednesday evenings (Sep-May).', linkLabel: 'Learn More', linkUrl: 'youth-formation.html' }
      ] },
      { type: 'heading', text: 'How to Join or Start a Group' },
      { type: 'text', body: "We want to help you find or create a small group that matches your spiritual interests and schedule. Whether you're looking to join an existing group or feel called to start something new, we're here to support you.\n\n**General Info About Joining:** Most groups are open to new members throughout the year. Some groups meet seasonally or have specific focus areas. Contact us to find out which group is right for you!\n\n**Want to Start Something New?** If you have an idea for a small group—whether a Bible study, prayer group, fellowship gathering, or other formation—we'd love to hear from you. Our small groups coordinator can help you get started." },
      { type: 'contact', name: 'Elizabeth McCanna', role: 'Director of Evangelization', email: 'emccanna@stpetersmendota.org', phone: '651-905-4312', note: 'Elizabeth can answer questions about existing groups, help you find the right fit for your faith journey, or discuss starting a new group.' },
      { type: 'button', label: 'Contact to Learn More', url: 'mailto:emccanna@stpetersmendota.org', style: 'primary' }
    ]
  }
};
