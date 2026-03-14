document.addEventListener('DOMContentLoaded', async () => {
    const courseList = document.getElementById('course-list');
    let allCourses = [];
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/courses`);
        allCourses = await res.json();
    } catch (error) {
        courseList.innerHTML = '<p>Error loading courses.</p>';
        return;
    }

    const images = [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80',
        'https://images.unsplash.com/photo-1526379879527-8559cc2ac494?w=500&q=80',
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80'
    ];

    const displayCourses = (coursesToRender) => {
        courseList.innerHTML = '';
        if (coursesToRender.length === 0) {
            courseList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-size: 1.1rem; color: var(--text-muted); padding: 3rem;">No courses found matching your search. Try another keyword!</p>';
            return;
        }

        coursesToRender.forEach((course) => {
            const index = allCourses.findIndex(c => c._id === course._id);
            const imgUrl = images[index % images.length];
            // Deterministic random rating between 4.5 and 4.9 based on index
            const rating = (4.5 + ((index * 0.1) % 0.4)).toFixed(1);
            const reviews = 1120 + (index * 450);
            
            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <img src="${imgUrl}" class="course-image" alt="${course.title}">
                <div class="course-card-content">
                    <h3>${course.title}</h3>
                    <div class="course-instructor">${course.instructor}</div>
                    <div class="course-rating">
                        ${rating} ⭐⭐⭐⭐⭐ <span class="reviews">(${reviews.toLocaleString()})</span>
                    </div>
                    <div class="course-footer" style="padding-top: 1rem;">
                        <div class="course-price">$${course.price}</div>
                        <button onclick="buyCourse('${course._id}')" class="btn" style="padding: 0.5rem 1rem;">Enroll Now</button>
                    </div>
                </div>
            `;
            courseList.appendChild(card);
        });
    };

    // Check for search query in URL from other pages
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const filtered = allCourses.filter(c => c.title.toLowerCase().includes(query) || c.instructor.toLowerCase().includes(query));
        displayCourses(filtered);
    } else {
        displayCourses(allCourses);
    }

    // Live search functionality on the Courses page itself
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query) {
                const filtered = allCourses.filter(c => c.title.toLowerCase().includes(query) || c.instructor.toLowerCase().includes(query) || c.description.toLowerCase().includes(query));
                displayCourses(filtered);
                // Update URL parameter without reloading the page
                window.history.replaceState({}, '', `?search=${encodeURIComponent(query)}`);
            } else {
                displayCourses(allCourses);
                window.history.replaceState({}, '', window.location.pathname);
            }
        });
    }
});

async function buyCourse(courseId) {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/enrollments`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ course_id: courseId })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            const courseRes = await fetch(`${API_BASE_URL}/api/courses`);
            const courses = await courseRes.json();
            const course = courses.find(c => c._id === courseId);
            
            if (course && course.youtube_link) {
                showAlert('Enrollment successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = `dashboard.html?play=${encodeURIComponent(course.youtube_link)}`;
                }, 1500);
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            showAlert(data.message || 'Error processing purchase', 'error');
        }
    } catch (error) {
        showAlert('Server error. Please try again.', 'error');
    }
}
