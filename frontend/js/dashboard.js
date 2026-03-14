document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Handle auto-play from enrollment redirect
    const urlParams = new URLSearchParams(window.location.search);
    const playLink = urlParams.get('play');
    if (playLink) {
        // Clean up the URL so back button doesn't trigger it again
        window.history.replaceState({}, document.title, window.location.pathname);
        
        let targetLink = decodeURIComponent(playLink);
        // Force YouTube videos to autoplay if possible
        if (targetLink.includes('youtube.com/watch') && !targetLink.includes('autoplay')) {
            targetLink += (targetLink.includes('?') ? '&' : '?') + 'autoplay=1';
        }
        window.location.href = targetLink;
        return;
    }

    const user = getUser();
    document.getElementById('user-name').innerHTML = `Welcome back, <strong>${user.name.split(' ')[0]}</strong>!`;

    const enrolledList = document.getElementById('enrolled-courses');
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/enrollments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const enrollments = await res.json();
        
        enrolledList.innerHTML = '';
        
        if (!res.ok) {
            enrolledList.innerHTML = '<p>Error loading your courses.</p>';
            return;
        }

        if (enrollments.length === 0) {
            enrolledList.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: left; padding: 2rem; background: var(--card-bg); border-radius: 12px; border: 1px dashed var(--border-color);">
                    <p style="margin-bottom: 1.5rem; font-size: 1.1rem; color: var(--text-muted);">You aren't taking any courses yet.</p>
                    <a href="courses.html" class="btn">Explore Courses</a>
                </div>
            `;
            return;
        }

        const images = [
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80',
            'https://images.unsplash.com/photo-1526379879527-8559cc2ac494?w=500&q=80',
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80',
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80'
        ];

        enrollments.forEach((enrollment, index) => {
            const course = enrollment.course_id;
            if(!course) return; // In case course was deleted
            
            const imgUrl = images[index % images.length];

            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <img src="${imgUrl}" class="course-image" alt="${course.title}">
                <div class="course-card-content">
                    <h3>${course.title}</h3>
                    <div class="course-instructor">${course.instructor}</div>
                    
                    <div style="margin: 1rem 0; width: 100%; background: #e5e7eb; height: 6px; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${Math.floor(Math.random() * 80) + 10}%; height: 100%; background: var(--primary-color);"></div>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); text-align: right; margin-bottom: 1rem;">In progress</div>

                    <div class="course-footer" style="padding-top: 0; border: none; justify-content: flex-end;">
                        <button onclick="watchCourse('${encodeURIComponent(course.youtube_link || '')}', '${encodeURIComponent(course.title || '')}')" class="btn btn-block">Watch Course</button>
                    </div>
                </div>
            `;
            enrolledList.appendChild(card);
        });
    } catch (error) {
        enrolledList.innerHTML = '<p>Server error. Could not load your courses.</p>';
    }
});

function watchCourse(encodedLink, encodedTitle) {
    const link = decodeURIComponent(encodedLink);
    if (link && link !== 'undefined') {
        let targetLink = link;
        // Force YouTube videos to autoplay if possible
        if (targetLink.includes('youtube.com/watch') && !targetLink.includes('autoplay')) {
            targetLink += (targetLink.includes('?') ? '&' : '?') + 'autoplay=1';
        }
        window.location.href = targetLink;
    } else {
        showAlert('Course link not available', 'error');
    }
}
