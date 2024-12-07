// إضافة مستمع البحث لجميع الصفحات
const searchBar = document.querySelector('.search-bar');
let searchTimeout;

searchBar.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const searchTerm = e.target.value.trim();
  
  if (searchTerm.length > 2) {
    // إذا كنا في صفحة غير الرئيسية، انتقل إلى الصفحة الرئيسية مع مصطلح البحث
    if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
      window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
      return;
    }
    
    searchTimeout = setTimeout(async () => {
      const movies = await searchMovies(searchTerm);
      displayMoviesInSection(movies, '.featured-section');
      
      // إخفاء الأقسام الأخرى أثناء البحث
      document.querySelector('.trending-section')?.style.display = 'none';
      document.querySelector('.top-rated-section')?.style.display = 'none';
    }, 500);
  }
});

// تحديث القائمة النشطة
function updateActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// إضافة الرأس المشترك
function createHeader() {
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <a href="index.html" class="logo">WatchMovies</a>
    <nav class="nav">
      <a href="index.html">الرئيسية</a>
      <a href="genres.html">التصنيفات</a>
      <a href="my-list.html">قائمتي</a>
      <input type="search" class="search-bar" placeholder="ابحث عن الأفلام...">
    </nav>
  `;
  document.body.insertBefore(header, document.body.firstChild);
}

// إضافة التذييل المشترك
function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer-grid">
      <div class="footer-links">
        <h4>الموقع</h4>
        <a href="index.html">الرئيسية</a>
        <a href="genres.html">التصنيفات</a>
        <a href="my-list.html">قائمتي</a>
      </div>
      <div class="footer-links">
        <h4>المساعدة</h4>
        <a href="#">مركز المساعدة</a>
        <a href="#">تواصل معنا</a>
        <a href="#">الأسئلة الشائعة</a>
      </div>
      <div class="footer-links">
        <h4>قانوني</h4>
        <a href="#">سياسة الخصوصية</a>
        <a href="#">شروط الاستخدام</a>
      </div>
    </div>
  `;
  document.body.appendChild(footer);
}

// تهيئة القائمة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  createHeader();
  createFooter();
  updateActiveNavLink();
  
  // التحقق من وجود مصطلح بحث في URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('search');
  if (searchTerm) {
    const searchBar = document.querySelector('.search-bar');
    searchBar.value = searchTerm;
    searchBar.dispatchEvent(new Event('input'));
  }
});
