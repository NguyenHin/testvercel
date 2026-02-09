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

// Hàm thêm vào giỏ hàng bằng AJAX
function addToCart(productId) {
    const quantity = document.getElementById('qtyInput').value;

    fetch(`/cart/add/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 1. Cập nhật Badge số lượng
            let badge = document.querySelector('.cart-badge');

            // Nếu chưa có badge (giỏ hàng trống), tìm icon giỏ hàng và thêm badge vào
            if (!badge) {
                // Tìm thẻ a chứa icon giỏ hàng (trong menu.ejs class là .action-item có icon fa-shopping-cart)
                const cartLink = document.querySelector('a[href="/cart"]');
                if (cartLink) {
                    badge = document.createElement('span');
                    badge.className = 'cart-badge';
                    // Style cứng để đảm bảo hiện ngay
                    badge.style.position = 'absolute';
                    badge.style.top = '-5px';
                    badge.style.right = '0';
                    badge.style.backgroundColor = '#C92127';
                    badge.style.color = 'white';
                    badge.style.fontSize = '0.7rem';
                    badge.style.padding = '2px 6px';
                    badge.style.borderRadius = '50%';
                    badge.style.fontWeight = 'bold';

                    cartLink.appendChild(badge);
                    cartLink.style.position = 'relative'; // Đảm bảo cha có relative
                }
            }

            if (badge) {
                badge.innerText = data.totalQty;
                // Hiệu ứng nhấp nháy
                badge.style.transform = 'scale(1.5)';
                setTimeout(() => badge.style.transform = 'scale(1)', 300);
            }

            // 2. Hiện Toast thông báo
            // Tìm element toast trong DOM
            const toastEl = document.getElementById('cartToast');
            if (toastEl) {
                // Cập nhật nội dung nếu cần (tùy chọn)
                // document.getElementById('toastMessage').innerText = data.message;

                // Dùng Bootstrap Toast API
                const toast = new bootstrap.Toast(toastEl);
                toast.show();
            } else {
                console.error("Không tìm thấy element #cartToast");
                alert("Thêm vào giỏ hàng thành công!"); // Fallback
            }

        } else {
            // Hiện Toast lỗi
            const toastEl = document.getElementById('errorToast');
            if (toastEl) {
                document.getElementById('errorMessage').innerText = data.message;
                const toast = new bootstrap.Toast(toastEl);
                toast.show();
            } else {
                alert(data.message);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Hàm mua ngay
function buyNow(productId) {
    const quantity = document.getElementById('qtyInput').value;

    fetch(`/cart/add/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/cart';
        } else {
            const toastEl = document.getElementById('errorToast');
            if (toastEl) {
                document.getElementById('errorMessage').innerText = data.message;
                const toast = new bootstrap.Toast(toastEl);
                toast.show();
            } else {
                alert(data.message);
            }
        }
    });
}