document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/';
        return;
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = '/';
    });

    document.getElementById('backBtn').addEventListener('click', () => {
        if (user.role === 'admin') {
            window.location.href = '/admin-dashboard';
        } else {
            window.location.href = '/tenant-dashboard';
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id');
    const detailsCard = document.getElementById('detailsCard');

    if (!requestId) {
        detailsCard.innerHTML = '<p class="error-message" style="display:block;">No request ID provided.</p>';
        return;
    }

    const loadDetails = async () => {
        try {
            const response = await fetch(`/api/requests/${requestId}`);
            
            if (!response.ok) {
                detailsCard.innerHTML = '<p class="error-message" style="display:block;">Request not found or access denied.</p>';
                return;
            }

            const reqData = await response.json();

            // Simple validation to ensure tenants only see their own requests (enforced on backend too)
            if (user.role !== 'admin' && reqData.user_id !== user.id) {
                detailsCard.innerHTML = '<p class="error-message" style="display:block;">Access denied.</p>';
                return;
            }

            detailsCard.innerHTML = `
                <h3>Request #${reqData.id} - ${reqData.title}</h3>
                <div style="margin-top: 20px;">
                    <p><strong>Status:</strong> ${reqData.status}</p>
                    <p><strong>Created At:</strong> ${new Date(reqData.created_at).toLocaleString()}</p>
                    <p><strong>Submitted By User ID:</strong> ${reqData.user_id}</p>
                    <div style="margin-top: 15px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; border: 1px solid #ddd;">
                        <strong>Description:</strong><br><br>
                        ${reqData.description}
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error loading request details:', error);
            detailsCard.innerHTML = '<p class="error-message" style="display:block;">An error occurred while loading details.</p>';
        }
    };

    loadDetails();
});
