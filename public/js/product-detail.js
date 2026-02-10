document.addEventListener('DOMContentLoaded', function() {
    const btnAddToCart = document.getElementById('btnAddToCart');
    const btnBuyNow = document.getElementById('btnBuyNow');

    if (btnAddToCart) {
        btnAddToCart.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            addToCart(id);
        });
    }

    if (btnBuyNow) {
        btnBuyNow.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            buyNow(id);
        });
    }

    updateDeliveryDate();
});

function increaseQty() {
    let input = document.getElementById('qtyInput');
    input.value = parseInt(input.value) + 1;
}

function decreaseQty() {
    let input = document.getElementById('qtyInput');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function addToCart(productId) {
    const quantity = document.getElementById('qtyInput').value;

    fetch(`/cart/add/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Hiện Popup Giữa Màn Hình
            const popup = document.getElementById('centerSuccessPopup');
            if (popup) {
                popup.classList.add('show');
                setTimeout(() => popup.classList.remove('show'), 2000);
            }

            // Cập nhật Badge
            let badge = document.querySelector('.cart-badge');
            if (!badge) {
                const cartLink = document.querySelector('a[href="/cart"]');
                if (cartLink) {
                    badge = document.createElement('span');
                    badge.className = 'cart-badge';
                    badge.style.position = 'absolute';
                    badge.style.top = '0';
                    badge.style.right = '-5px';
                    badge.style.backgroundColor = '#c49b63';
                    badge.style.color = 'white';
                    badge.style.fontSize = '0.7rem';
                    badge.style.padding = '2px 6px';
                    badge.style.borderRadius = '50%';
                    badge.style.fontWeight = 'bold';
                    badge.style.border = '2px solid white';
                    cartLink.appendChild(badge);
                    cartLink.style.position = 'relative';
                }
            }
            if (badge) badge.innerText = data.totalQty;
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

function buyNow(productId) {
    const quantity = document.getElementById('qtyInput').value;
    fetch(`/cart/add/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) window.location.href = '/cart';
        else alert(data.message);
    });
}

function updateDeliveryDate() {
    const deliveryEl = document.getElementById('deliveryDate');
    if (!deliveryEl) return;

    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 2);

    const options = { weekday: 'long', day: 'numeric', month: 'numeric' };
    const dateString = deliveryDate.toLocaleDateString('vi-VN', options);
    const formattedDate = dateString.replace(/^\w/, (c) => c.toUpperCase());

    deliveryEl.innerText = `Dự kiến giao ${formattedDate}`;
}

// Các hàm xử lý Modal và Địa chỉ (Giữ nguyên hoặc chuyển sang file riêng nếu muốn)
function openLoginModal() {
    // Logic mở modal login...
    // (Để đơn giản, phần này có thể giữ lại trong EJS hoặc chuyển sang file JS chung)
    const loginModalEl = document.getElementById('loginModal');
    if (loginModalEl) {
        const modal = new bootstrap.Modal(loginModalEl);
        modal.show();
    }
}

function setRatingText(text) {
    const ratingTextEl = document.getElementById('ratingText');
    if (ratingTextEl) ratingTextEl.innerText = text;
}

function updateDistricts() {
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    if (!provinceSelect || !districtSelect) return;

    const province = provinceSelect.value;
    districtSelect.innerHTML = '';

    let districts = [];
    if (province === 'Hồ Chí Minh') districts = ['Quận 1', 'Quận 3', 'Thủ Đức', 'Bình Thạnh'];
    else if (province === 'Hà Nội') districts = ['Hoàn Kiếm', 'Ba Đình', 'Cầu Giấy'];
    else districts = ['Quận trung tâm', 'Huyện ngoại thành'];

    districts.forEach(d => {
        const option = document.createElement('option');
        option.value = d;
        option.text = d;
        districtSelect.appendChild(option);
    });
}

function saveAddress() {
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const currentAddressEl = document.getElementById('currentAddress');
    const addressModalEl = document.getElementById('addressModal');

    if (provinceSelect && districtSelect && currentAddressEl) {
        const province = provinceSelect.value;
        const district = districtSelect.value;
        currentAddressEl.innerText = `${district}, ${province}`;

        if (addressModalEl) {
            const modal = bootstrap.Modal.getInstance(addressModalEl);
            if (modal) modal.hide();
        }
        updateDeliveryDate();
    }
}