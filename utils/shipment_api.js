// Giả lập API của đơn vị vận chuyển (ví dụ: Giao Hàng Nhanh)
module.exports = {
    createShipmentOrder: async (order) => {
        return new Promise((resolve) => {
            // Giả lập độ trễ mạng 1 giây
            setTimeout(() => {
                // Tạo mã vận đơn ngẫu nhiên
                const randomCode = Math.floor(10000000 + Math.random() * 90000000);
                const trackingCode = `GHN-${randomCode}`;

                console.log(`[SHIPMENT API] Created order for Order #${order.id}. Tracking Code: ${trackingCode}`);

                resolve({
                    success: true,
                    tracking_code: trackingCode,
                    expected_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 ngày sau
                });
            }, 1000);
        });
    }
};