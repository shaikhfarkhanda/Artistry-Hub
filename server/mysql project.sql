use art_gallery;
-- 1. Users Table (Base table for all user types)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('artist', 'admin', 'buyer') NOT NULL,
    status ENUM('active', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
insert into users(username,email,password,role,status)  values("farkhanda","shaikhfarkhanda14@gmail.com","SHAIKHFAR15","admin","active");
select * from users;
-- 2. Artists Table (Extended info for artists)
CREATE TABLE artists (
    artist_id INT AUTO_INCREMENT PRIMARY KEY,
    id INT NOT NULL,
    biography TEXT,
    contact VARCHAR(255) UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Artworks Table
CREATE TABLE artworks (
    artwork_id INT AUTO_INCREMENT PRIMARY KEY,
    artist_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type ENUM('Canvas Painting', 'Water Painting', 'Knife Painting', 'Portrait') NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES users(id)
);
-- INSERT INTO artworks (title, type, description, price, image_url, status) VALUES
-- ('Sunset Horizon', 'Canvas Painting', 'A vibrant depiction of a sunset on canvas.', 10000, 'images/canvas1.png','approved'),
-- ('Tranquil Waters', 'Water Painting', 'A calming water painting of a lake and mountains.', 12000, 'images/water1.jpg','approved'),
-- ('Abstract Flow', 'Knife Painting', 'An abstract painting made with knife strokes for texture.', 30000, 'images/knife1.jpg','approved'),
-- ('Portrait of a Lady', 'Portrait', 'A realistic portrait of a woman in traditional attire.', 35000, 'images/portrait1.jpeg','approved'),
-- ('Forest Path', 'Canvas Painting', 'A path through a lush green forest, painted on canvas.', 15000, 'images/canvas2.jpg','approved'),
-- ('Ocean Waves', 'Water Painting', 'A beautiful water painting of ocean waves crashing on the shore.', 18000, 'images/water2.jpg','approved'),
-- ('Urban Landscape', 'Knife Painting', 'A knife painting showcasing a busy urban landscape.', 45000, 'images/knife2.jpg','approved'),
-- ('Self-Portrait', 'Portrait', 'A self-portrait with rich colors and intricate details.', 28000, 'images/portrait2.jpg','approved');


-- 4. Cart Table
CREATE TABLE cart (
    id INT,
    artwork_id INT,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id, artwork_id),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE CASCADE
);

-- 5. Orders Table
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    id INT,
    total_price DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 100.00,
    payment_method ENUM('card', 'upi', 'cod') NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'failed') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Order Items Table
CREATE TABLE order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    artwork_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) NOT NULL,
    artist_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE SET NULL
);

-- 7. Delivery Info Table
CREATE TABLE delivery_info (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    address TEXT NOT NULL,
    contact VARCHAR(15) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- 8. Bills Table
CREATE TABLE bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    buyer_id INT,
    artwork_id INT,
    amount DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 100.00,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE SET NULL
);

-- 9. Messages Table
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL
);