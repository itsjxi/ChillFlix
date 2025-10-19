# ChillFlix - Modern Movie & TV Show Discovery Platform

A fully responsive, modern movie and TV show rating website built with vanilla JavaScript MVC architecture and TMDB API integration.

## 🚀 Features

### Core Functionality
- **TMDB API Integration**: Trending, popular, top-rated, and upcoming content
- **Advanced Search**: Real-time search with autocomplete and media type filtering
- **Genre-based Discovery**: Dynamic filtering by genres for movies and TV shows
- **Infinite Scroll**: Seamless content loading with Intersection Observer API
- **Detailed Views**: Comprehensive movie/TV show details with cast, crew, reviews, and similar titles

### UI/UX Features
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle with localStorage persistence
- **Modern Design**: Clean, immersive interface with smooth animations
- **Hero Section**: Featured trending content with backdrop imagery
- **Horizontal Carousels**: Trending and top-rated content sections
- **Smart Search Bar**: Sticky search with debounced suggestions

### Technical Features
- **MVC Architecture**: Clean separation of concerns with modular components
- **Client-side Routing**: Hash-based routing with History API
- **State Management**: LocalStorage for watchlist and preferences
- **Performance Optimized**: Lazy loading, debounced search, skeleton loading states
- **Error Handling**: Comprehensive error handling and user feedback

## 🏗️ Architecture

### Folder Structure
```
ChillFlix/
├── models/
│   └── tmdbApi.js          # TMDB API interactions
├── views/
│   ├── movieCardView.js    # Movie card components
│   ├── searchBarView.js    # Search interface
│   ├── genreChipsView.js   # Genre filtering
│   └── infiniteScrollListView.js # Infinite scroll implementation
├── controllers/
│   ├── homeController.js   # Home page logic
│   ├── searchController.js # Search functionality
│   └── detailController.js # Detail page logic
├── utils/
│   ├── debounce.js        # Debounce utility
│   ├── themeToggle.js     # Theme switching
│   └── localStorageHelper.js # Data persistence
├── css/
│   ├── styles.css         # Main styles
│   └── loading.css        # Loading animations
├── config.js              # API configuration
├── app.js                 # Main application and routing
└── index.html             # HTML shell
```

### MVC Pattern
- **Models**: Handle data fetching and API interactions
- **Views**: Manage DOM rendering and UI components
- **Controllers**: Orchestrate business logic between models and views

## 🛠️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ChillFlix.git
   cd ChillFlix
   ```

2. **API Configuration**
   - The TMDB API key is already configured in `config.js`
   - For production, move the API key to environment variables

3. **Serve the application**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using Live Server (VS Code extension)
   # Right-click index.html and select "Open with Live Server"
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:8000`

## 🎯 Usage

### Navigation
- **Home**: Browse trending content and explore by genre
- **Search**: Use the search bar with real-time suggestions
- **Details**: Click any movie/TV show for detailed information
- **Watchlist**: Save favorites for later viewing

### Features
- **Theme Toggle**: Click the theme button in the header
- **Genre Filtering**: Select genres to filter content
- **Infinite Scroll**: Scroll down to load more content automatically
- **Responsive Design**: Works seamlessly across all device sizes

## 🔧 Technical Implementation

### Key Technologies
- **Vanilla JavaScript (ES6+)**: Modern JavaScript features
- **CSS Grid & Flexbox**: Responsive layout system
- **Intersection Observer API**: Infinite scroll implementation
- **Fetch API**: HTTP requests to TMDB
- **LocalStorage**: Data persistence
- **CSS Custom Properties**: Theme system

### Performance Optimizations
- **Debounced Search**: Prevents API spam during typing
- **Lazy Loading**: Images load only when needed
- **Skeleton Loading**: Smooth loading states
- **Efficient DOM Updates**: Minimal reflows and repaints

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features required
- CSS Grid and Flexbox support needed

## 🎨 Design Philosophy

### Unique Design Elements
- **Immersive Hero Section**: Full-screen featured content
- **Gradient Overlays**: Smooth visual transitions
- **Card-based Layout**: Clean, organized content presentation
- **Smooth Animations**: Subtle hover effects and transitions
- **Typography**: Modern font stack with proper hierarchy

### Responsive Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🚀 Future Enhancements

### Planned Features
- **User Authentication**: Personal accounts and sync
- **Advanced Filtering**: Release year, rating, runtime filters
- **Recommendations**: AI-powered content suggestions
- **Social Features**: Reviews, ratings, and sharing
- **Offline Support**: Service worker implementation
- **Progressive Web App**: PWA capabilities

### Technical Improvements
- **TypeScript**: Type safety and better development experience
- **Build System**: Webpack or Vite for optimization
- **Testing**: Unit and integration tests
- **CI/CD**: Automated deployment pipeline

## 📱 Mobile Experience

The application is fully optimized for mobile devices with:
- Touch-friendly interface
- Swipe gestures for carousels
- Responsive typography
- Optimized image loading
- Mobile-first design approach

## 🔒 Security

- **API Key Protection**: Secure API key handling
- **Input Sanitization**: XSS prevention
- **HTTPS**: Secure data transmission
- **Content Security Policy**: Additional security layer

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@chillflix.com or create an issue in the GitHub repository.

---

**ChillFlix** - Discover your next favorite movie or TV show! 🎬✨