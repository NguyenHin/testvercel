const Product = require('../models/Product');

class PageController {
    static staticPages = {
        'terms': {
            title: 'Điều khoản sử dụng',
            content: `
                <div class="static-content">
                    <p>Chào mừng bạn đến với <strong>BookTotal</strong>. Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây. Vui lòng đọc kỹ trước khi sử dụng website.</p>

                    <h5 class="mt-4">1. Chấp thuận các Điều khoản</h5>
                    <p>Bằng cách truy cập và sử dụng website BookTotal, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các điều khoản này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không nên sử dụng dịch vụ của chúng tôi.</p>

                    <h5 class="mt-4">2. Tài khoản Người dùng</h5>
                    <p>Để thực hiện mua hàng, bạn có thể cần đăng ký tài khoản. Bạn có trách nhiệm duy trì tính bảo mật của thông tin tài khoản và mật khẩu của mình. Bạn đồng ý chịu trách nhiệm cho tất cả các hoạt động xảy ra dưới tài khoản của mình.</p>

                    <h5 class="mt-4">3. Quyền sở hữu trí tuệ</h5>
                    <p>Tất cả nội dung trên website, bao gồm nhưng không giới hạn ở văn bản, đồ họa, logo, biểu tượng, hình ảnh và phần mềm, là tài sản của BookTotal hoặc các nhà cung cấp nội dung của nó và được bảo vệ bởi luật bản quyền quốc tế.</p>

                    <h5 class="mt-4">4. Giới hạn trách nhiệm</h5>
                    <p>BookTotal không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên hoặc do hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng website hoặc dịch vụ của chúng tôi.</p>

                    <h5 class="mt-4">5. Thay đổi Điều khoản</h5>
                    <p>Chúng tôi có quyền thay đổi các điều khoản này bất kỳ lúc nào. Việc bạn tiếp tục sử dụng website sau khi có các thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.</p>
                </div>`
        },
        'privacy': {
            title: 'Chính sách bảo mật',
            content: `
                <div class="static-content">
                    <p>Tại <strong>BookTotal</strong>, chúng tôi coi trọng quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.</p>

                    <h5 class="mt-4">1. Thông tin chúng tôi thu thập</h5>
                    <p>Chúng tôi thu thập thông tin bạn cung cấp trực tiếp cho chúng tôi, chẳng hạn như khi bạn tạo tài khoản, thực hiện mua hàng, đăng ký nhận bản tin hoặc liên hệ với bộ phận hỗ trợ khách hàng. Thông tin này có thể bao gồm tên, địa chỉ email, địa chỉ giao hàng, số điện thoại và thông tin thanh toán.</p>

                    <h5 class="mt-4">2. Cách chúng tôi sử dụng thông tin</h5>
                    <p>Chúng tôi sử dụng thông tin thu thập được để:</p>
                    <ul>
                        <li>Xử lý và giao đơn hàng của bạn.</li>
                        <li>Gửi thông báo về trạng thái đơn hàng.</li>
                        <li>Cải thiện và tối ưu hóa trải nghiệm người dùng trên website.</li>
                        <li>Gửi thông tin quảng cáo và khuyến mãi (nếu bạn đồng ý).</li>
                        <li>Ngăn chặn các hoạt động gian lận và đảm bảo an ninh hệ thống.</li>
                    </ul>

                    <h5 class="mt-4">3. Chia sẻ thông tin</h5>
                    <p>Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin với các đối tác dịch vụ đáng tin cậy (như đơn vị vận chuyển, cổng thanh toán) để thực hiện các giao dịch của bạn.</p>

                    <h5 class="mt-4">4. Bảo mật dữ liệu</h5>
                    <p>Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu cá nhân của bạn khỏi việc truy cập, thay đổi hoặc tiêu hủy trái phép.</p>
                </div>`
        },
        'payment-privacy': {
            title: 'Chính sách bảo mật thanh toán',
            content: `
                <div class="static-content">
                    <p>Hệ thống thanh toán của <strong>BookTotal</strong> được thiết kế để đảm bảo an toàn tuyệt đối cho mọi giao dịch tài chính của khách hàng.</p>

                    <h5 class="mt-4">1. Tiêu chuẩn bảo mật</h5>
                    <p>Chúng tôi hợp tác với các cổng thanh toán hàng đầu Việt Nam như VNPAY và MoMo, tuân thủ các tiêu chuẩn bảo mật quốc tế khắt khe nhất như PCI DSS.</p>

                    <h5 class="mt-4">2. Mã hóa dữ liệu</h5>
                    <p>Mọi thông tin thanh toán của bạn đều được mã hóa bằng giao thức SSL (Secure Sockets Layer) trước khi truyền đi qua internet, đảm bảo không ai có thể can thiệp hoặc đánh cắp thông tin.</p>

                    <h5 class="mt-4">3. Không lưu trữ thông tin thẻ</h5>
                    <p>BookTotal cam kết không lưu trữ thông tin thẻ tín dụng hoặc tài khoản ngân hàng của khách hàng trên hệ thống của mình. Toàn bộ quá trình xác thực và thanh toán được thực hiện trực tiếp trên hạ tầng của ngân hàng hoặc ví điện tử đối tác.</p>

                    <h5 class="mt-4">4. Xác thực giao dịch</h5>
                    <p>Mọi giao dịch thanh toán trực tuyến đều yêu cầu xác thực qua mã OTP (One Time Password) gửi về số điện thoại của bạn, tạo thêm một lớp bảo vệ vững chắc.</p>
                </div>`
        },
        'about': {
            title: 'Giới thiệu BookTotal',
            content: `
                <div class="static-content">
                    <div class="text-center mb-4">
                        <img src="/images/about-banner.jpg" class="img-fluid rounded shadow-sm" alt="Về BookTotal" onerror="this.style.display='none'">
                    </div>
                    <p><strong>BookTotal</strong> là điểm đến lý tưởng cho những người yêu sách tại Việt Nam. Được thành lập từ năm 2024, chúng tôi không chỉ là một cửa hàng bán sách trực tuyến, mà còn là một cộng đồng kết nối tri thức.</p>

                    <h5 class="mt-4">Sứ mệnh của chúng tôi</h5>
                    <p>Mang tri thức đến mọi nhà với chi phí hợp lý nhất và dịch vụ tận tâm nhất. Chúng tôi tin rằng mỗi cuốn sách là một cánh cửa mở ra thế giới mới, và nhiệm vụ của chúng tôi là giúp bạn mở những cánh cửa đó một cách dễ dàng.</p>

                    <h5 class="mt-4">Giá trị cốt lõi</h5>
                    <ul>
                        <li><strong>Chất lượng:</strong> Chỉ cung cấp sách chính hãng 100% từ các nhà xuất bản uy tín.</li>
                        <li><strong>Tận tâm:</strong> Luôn đặt khách hàng làm trung tâm trong mọi hoạt động.</li>
                        <li><strong>Sáng tạo:</strong> Không ngừng cải tiến công nghệ để mang lại trải nghiệm mua sắm hiện đại.</li>
                        <li><strong>Trách nhiệm:</strong> Đóng góp tích cực cho sự phát triển văn hóa đọc của cộng đồng.</li>
                    </ul>

                    <h5 class="mt-4">Đội ngũ của chúng tôi</h5>
                    <p>BookTotal quy tụ những người trẻ đầy nhiệt huyết, am hiểu về sách và công nghệ, luôn sẵn sàng hỗ trợ bạn tìm kiếm những tựa sách phù hợp nhất với nhu cầu của mình.</p>
                </div>`
        },
        'store-system': {
            title: 'Hệ thống trung tâm - nhà sách',
            content: `
                <div class="static-content">
                    <p>BookTotal hiện đang mở rộng mạng lưới cửa hàng vật lý để mang lại trải nghiệm trực tiếp cho khách hàng. Dưới đây là danh sách các trung tâm và nhà sách đối tác của chúng tôi:</p>

                    <h5 class="mt-4 text-danger"><i class="fas fa-map-marker-alt me-2"></i> Trụ sở chính</h5>
                    <p><strong>Trung tâm Công nghệ BookTotal</strong><br>
                    Địa chỉ: Khu Công nghệ cao, Phường Hiệp Phú, TP. Thủ Đức, TP. Hồ Chí Minh<br>
                    Hotline: 1900 636 467</p>

                    <h5 class="mt-4 text-primary"><i class="fas fa-store me-2"></i> Chi nhánh TP. Hồ Chí Minh</h5>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="p-3 border rounded">
                                <h6>Nhà sách BookTotal Quận 1</h6>
                                <p class="small mb-0 text-muted">123 Lê Lợi, Phường Bến Thành, Quận 1<br>Giờ mở cửa: 08:00 - 22:00</p>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="p-3 border rounded">
                                <h6>Nhà sách BookTotal Bình Thạnh</h6>
                                <p class="small mb-0 text-muted">475A Điện Biên Phủ, Phường 25, Q. Bình Thạnh<br>Giờ mở cửa: 08:00 - 21:30</p>
                            </div>
                        </div>
                    </div>

                    <h5 class="mt-4 text-primary"><i class="fas fa-store me-2"></i> Chi nhánh Hà Nội</h5>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="p-3 border rounded">
                                <h6>Nhà sách BookTotal Hoàn Kiếm</h6>
                                <p class="small mb-0 text-muted">45 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội<br>Giờ mở cửa: 08:30 - 22:00</p>
                            </div>
                        </div>
                    </div>
                </div>`
        },
        'return-policy': {
            title: 'Chính sách đổi trả',
            content: `
                <div class="static-content">
                    <p>BookTotal cam kết bảo vệ quyền lợi khách hàng thông qua chính sách đổi trả linh hoạt trong vòng <strong>7 ngày</strong> kể từ khi nhận hàng thành công.</p>

                    <h5 class="mt-4">1. Trường hợp được đổi trả miễn phí</h5>
                    <ul>
                        <li>Sản phẩm bị lỗi in ấn (mất trang, nhòe chữ, đóng ngược bìa).</li>
                        <li>Sản phẩm bị hư hỏng, móp méo nghiêm trọng trong quá trình vận chuyển.</li>
                        <li>Giao sai sản phẩm, sai số lượng so với đơn đặt hàng.</li>
                    </ul>

                    <h5 class="mt-4">2. Điều kiện đổi trả</h5>
                    <ul>
                        <li>Sản phẩm còn nguyên vẹn tem, mác và chưa qua sử dụng.</li>
                        <li>Có hóa đơn mua hàng hoặc bằng chứng giao dịch trên hệ thống BookTotal.</li>
                        <li>Khách hàng cung cấp hình ảnh/video khui hàng để làm bằng chứng đối soát.</li>
                    </ul>

                    <h5 class="mt-4">3. Quy trình thực hiện</h5>
                    <p>Bước 1: Liên hệ hotline 1900 636 467 hoặc gửi email về support@booktotal.com.<br>
                    Bước 2: Nhân viên CSKH sẽ xác nhận và hướng dẫn bạn gửi hàng về trung tâm.<br>
                    Bước 3: Sau khi nhận được hàng, chúng tôi sẽ kiểm tra và thực hiện đổi sản phẩm mới hoặc hoàn tiền trong vòng 3-5 ngày làm việc.</p>
                </div>`
        },
        'warranty-policy': {
            title: 'Chính sách bảo hành',
            content: `
                <div class="static-content">
                    <p>Đối với các sản phẩm không phải là sách (như văn phòng phẩm, thiết bị điện tử, quà tặng), BookTotal áp dụng chính sách bảo hành chính hãng.</p>

                    <h5 class="mt-4">1. Thời gian bảo hành</h5>
                    <ul>
                        <li>Văn phòng phẩm cao cấp: Bảo hành 6 tháng đối với lỗi kỹ thuật.</li>
                        <li>Thiết bị điện tử (Máy đọc sách, đèn học): Bảo hành 12 tháng theo tiêu chuẩn nhà sản xuất.</li>
                        <li>Quà tặng lưu niệm: Bảo hành đổi mới trong 7 ngày nếu có lỗi sản xuất.</li>
                    </ul>

                    <h5 class="mt-4">2. Địa điểm bảo hành</h5>
                    <p>Quý khách có thể mang sản phẩm trực tiếp đến các chi nhánh của BookTotal hoặc gửi qua đường bưu điện về Trung tâm Bảo hành tại TP. Thủ Đức.</p>

                    <h5 class="mt-4">3. Cam kết bồi hoàn</h5>
                    <p>BookTotal cam kết bồi hoàn 200% giá trị đơn hàng nếu khách hàng phát hiện sản phẩm là hàng giả, hàng nhái không đúng như mô tả trên website.</p>
                </div>`
        },
        'shipping-policy': {
            title: 'Chính sách vận chuyển',
            content: `
                <div class="static-content">
                    <p>BookTotal hợp tác với các đơn vị vận chuyển uy tín nhất (Giao Hàng Nhanh, Viettel Post, Ninja Van) để đảm bảo sách đến tay bạn nhanh chóng và an toàn.</p>

                    <h5 class="mt-4">1. Thời gian giao hàng dự kiến</h5>
                    <table class="table table-bordered mt-2">
                        <thead class="table-light">
                            <tr>
                                <th>Khu vực</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Nội thành TP.HCM & Hà Nội</td>
                                <td>1 - 2 ngày làm việc</td>
                            </tr>
                            <tr>
                                <td>Các tỉnh thành khác</td>
                                <td>3 - 5 ngày làm việc</td>
                            </tr>
                            <tr>
                                <td>Vùng sâu, vùng xa, hải đảo</td>
                                <td>5 - 7 ngày làm việc</td>
                            </tr>
                        </tbody>
                    </table>

                    <h5 class="mt-4">2. Phí vận chuyển</h5>
                    <p>Phí vận chuyển được tính tự động dựa trên trọng lượng đơn hàng và địa chỉ nhận hàng. Đặc biệt:</p>
                    <ul>
                        <li><strong>Miễn phí vận chuyển</strong> cho đơn hàng từ 500.000đ trở lên trên toàn quốc.</li>
                        <li>Hỗ trợ phí ship 15.000đ cho đơn hàng từ 250.000đ.</li>
                    </ul>

                    <h5 class="mt-4">3. Kiểm tra hàng</h5>
                    <p>Khách hàng được quyền kiểm tra ngoại quan gói hàng (không mở seal sản phẩm) trước khi thanh toán cho nhân viên giao hàng.</p>
                </div>`
        },
        'wholesale-policy': {
            title: 'Chính sách khách sỉ',
            content: `
                <div class="static-content">
                    <p>BookTotal luôn chào đón các đối tác đại lý, trường học và thư viện với chính sách chiết khấu vô cùng hấp dẫn.</p>

                    <h5 class="mt-4">1. Đối tượng áp dụng</h5>
                    <ul>
                        <li>Các nhà sách, cửa hàng văn phòng phẩm địa phương.</li>
                        <li>Trường học, trung tâm đào tạo mua sách số lượng lớn.</li>
                        <li>Doanh nghiệp mua sách làm quà tặng nhân viên/đối tác.</li>
                    </ul>

                    <h5 class="mt-4">2. Mức chiết khấu</h5>
                    <p>Tùy theo số lượng và danh mục sách, mức chiết khấu có thể dao động từ <strong>30% đến 45%</strong> so với giá bìa.</p>

                    <h5 class="mt-4">3. Quyền lợi đối tác</h5>
                    <ul>
                        <li>Hỗ trợ vận chuyển miễn phí cho đơn hàng sỉ trong nội thành TP.HCM.</li>
                        <li>Cung cấp đầy đủ hóa đơn VAT và chứng từ nguồn gốc xuất xứ.</li>
                        <li>Ưu tiên đặt hàng trước các tựa sách "hot" sắp phát hành.</li>
                    </ul>
                    <p>Mọi chi tiết vui lòng liên hệ Phòng Kinh doanh: <strong>0909 123 456</strong> (Mr. Tín).</p>
                </div>`
        },
        'payment-methods': {
            title: 'Phương thức thanh toán',
            content: `
                <div class="static-content">
                    <p>Để thuận tiện cho việc mua sắm, BookTotal cung cấp đa dạng các phương thức thanh toán an toàn và nhanh chóng:</p>

                    <h5 class="mt-4">1. Thanh toán khi nhận hàng (COD)</h5>
                    <p>Quý khách thanh toán tiền mặt trực tiếp cho nhân viên giao hàng sau khi đã nhận và kiểm tra gói hàng.</p>

                    <h5 class="mt-4">2. Thanh toán qua Cổng VNPAY</h5>
                    <p>Hỗ trợ thanh toán qua ứng dụng ngân hàng (Mobile Banking) bằng cách quét mã QR hoặc nhập thông tin thẻ ATM nội địa/thẻ quốc tế (Visa, Mastercard).</p>

                    <h5 class="mt-4">3. Thanh toán qua Ví điện tử MoMo</h5>
                    <p>Phương thức thanh toán nhanh chóng, tiện lợi chỉ với vài thao tác trên ứng dụng MoMo.</p>

                    <h5 class="mt-4">4. Chuyển khoản ngân hàng</h5>
                    <p>Dành cho khách hàng mua sỉ hoặc doanh nghiệp. Thông tin tài khoản sẽ được cung cấp cụ thể trong quá trình đặt hàng.</p>
                </div>`
        },
        'faq': {
            title: 'Câu hỏi thường gặp (FAQ)',
            content: `
                <div class="static-content">
                    <h5 class="mt-4">1. Tôi có thể hủy đơn hàng sau khi đã đặt không?</h5>
                    <p>Bạn hoàn toàn có thể hủy đơn hàng nếu trạng thái đơn hàng vẫn đang là "Chờ xác nhận". Vui lòng vào mục "Kiểm tra đơn hàng" trong tài khoản cá nhân để thực hiện hủy đơn.</p>

                    <h5 class="mt-4">2. Làm sao để tôi biết đơn hàng đã được gửi đi?</h5>
                    <p>Hệ thống sẽ gửi email thông báo và cập nhật mã vận đơn ngay khi hàng được bàn giao cho đơn vị vận chuyển. Bạn có thể dùng mã này để tra cứu trên website của nhà vận chuyển.</p>

                    <h5 class="mt-4">3. BookTotal có xuất hóa đơn VAT không?</h5>
                    <p>Có. Chúng tôi hỗ trợ xuất hóa đơn điện tử cho mọi đơn hàng. Quý khách vui lòng điền thông tin xuất hóa đơn trong phần "Ghi chú" khi đặt hàng hoặc liên hệ bộ phận kế toán trong vòng 24h sau khi đặt hàng.</p>

                    <h5 class="mt-4">4. Tôi nhận được sách bị lỗi thì phải làm sao?</h5>
                    <p>Đừng lo lắng! Bạn hãy chụp ảnh lỗi sản phẩm và liên hệ ngay với chúng tôi qua hotline 1900 636 467. Chúng tôi sẽ tiến hành đổi mới sản phẩm cho bạn hoàn toàn miễn phí.</p>
                </div>`
        }
    };

    static async home(req, res) {
        try {
            const products = await Product.getAllProducts();
            res.render('home', { products: products });
        } catch (err) {
            console.error(err);
            res.render('home', { products: [] });
        }
    }

    static showStaticPage(req, res) {
        const slug = req.params.slug;
        const pageData = PageController.staticPages[slug];
        if (pageData) {
            res.render('page', { title: pageData.title, content: pageData.content });
        } else {
            res.status(404).render('page', { title: 'Không tìm thấy trang', content: '<p>Nội dung không tồn tại.</p>' });
        }
    }
}

module.exports = PageController;
