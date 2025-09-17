<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$host = 'localhost';
$dbname = 'sajfood1_sales';
$username = 'sajfood1_sales';
$password = 'Sales1234@@@@';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Read Incoming Request
$request_body = file_get_contents('php://input');
if (empty($request_body)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Request body is empty']);
    exit;
}

$json_data = json_decode($request_body);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON in request body: ' . json_last_error_msg()]);
    exit;
}

$action = $json_data->action ?? null;
$data   = $json_data->data ?? null;

$response = [];

// Action Router
try {
    switch ($action) {
        case 'login':
            $username = $data->username ?? '';
            $password = $data->password ?? '';
            $stmt = $pdo->prepare("SELECT * FROM userss WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            if ($user && password_verify($password, $user['password_hash'])) {
                $response = [
                    "status" => "success",
                    "user" => ["id" => $user['id'], "username" => $user['username'], "role" => $user['role']]
                ];
            } else {
                http_response_code(401);
                $response = ["status" => "error", "message" => "Invalid username or password"];
            }
            break;

        case 'seed_users':
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("INSERT IGNORE INTO userss (username, password_hash, role) VALUES (?, ?, ?)");
            $default_users = [
                ['username' => 'director', 'password' => '123456', 'role' => 'director'],
                ['username' => 'manager', 'password' => '123456', 'role' => 'manager'],
                ['username' => 'alh murtala', 'password' => '123456', 'role' => 'staff'],
            ];
            foreach ($default_users as $user) {
                $password_hash = password_hash($user['password'], PASSWORD_BCRYPT);
                $stmt->execute([$user['username'], $password_hash, $user['role']]);
            }
            $pdo->commit();
            $response = ["status" => "success", "message" => "Users seeded"];
            break;

        case 'get_dashboard_data':
            $raw_material_sql = "SELECT SUM(quantity) as total_raw_material FROM inventory WHERE name IN ('Maize', 'Cassava')";
            $finished_goods_sql = "SELECT SUM(quantity) as total_finished_goods FROM finished_goods";
            $sales_sql = "SELECT SUM(grand_total) as total_sales_value, COUNT(*) as sales_count FROM sales_orders";
            $customers_sql = "SELECT COUNT(DISTINCT customer_name) as active_customers FROM sales_orders WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
            
            $recent_sales_stmt = $pdo->query("SELECT so.id, so.customer_name, so.order_date, so.grand_total as total_price, oi.product_name FROM sales_orders so LEFT JOIN (SELECT order_id, GROUP_CONCAT(DISTINCT product_name SEPARATOR ', ') as product_name FROM order_items GROUP BY order_id) oi ON so.id = oi.order_id ORDER BY so.order_date DESC, so.id DESC LIMIT 5");
            $recent_sales = $recent_sales_stmt->fetchAll();
            
            $response = [
                'total_raw_material' => $pdo->query($raw_material_sql)->fetchColumn() ?: 0,
                'total_finished_goods' => $pdo->query($finished_goods_sql)->fetchColumn() ?: 0,
                'total_sales_value' => $pdo->query($sales_sql)->fetch()['total_sales_value'] ?: 0,
                'sales_count' => $pdo->query($sales_sql)->fetch()['sales_count'] ?: 0,
                'active_customers' => $pdo->query($customers_sql)->fetchColumn() ?: 0,
                'recent_sales' => $recent_sales,
            ];
            break;

        case 'get_inventory':
            $response = $pdo->query("SELECT * FROM inventory ORDER BY name ASC")->fetchAll();
            break;

        case 'add_material':
            $stmt = $pdo->prepare("INSERT INTO inventory (name, quantity, unit) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)");
            $stmt->execute([$data->material, $data->quantity, $data->unit]);
            $response = ["status" => "success", "message" => "Material added successfully."];
            break;

        case 'get_production_history':
            $response = $pdo->query("SELECT id, date, 'Completed' as status, maize_input, maize_flour_output, dussa_output FROM production_batches ORDER BY date DESC")->fetchAll();
            break;

        case 'record_production':
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("INSERT INTO production_batches (date, maize_input, cassava_input, maize_flour_output, dussa_output) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$data->date, $data->maizeInput, $data->cassavaInput, $data->maizeFlourOutput, $data->dussaOutput]);
            
            $stmt_deduct_maize = $pdo->prepare("UPDATE inventory SET quantity = quantity - ? WHERE name = 'Maize'");
            $stmt_deduct_maize->execute([$data->maizeInput]);
            
            $stmt_deduct_cassava = $pdo->prepare("UPDATE inventory SET quantity = quantity - ? WHERE name = 'Cassava'");
            $stmt_deduct_cassava->execute([$data->cassavaInput]);

            $stmt_add_flour = $pdo->prepare("INSERT INTO finished_goods (name, quantity) VALUES ('Maize Flour', ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)");
            $stmt_add_flour->execute([$data->maizeFlourOutput]);

            $stmt_add_dussa = $pdo->prepare("INSERT INTO finished_goods (name, quantity) VALUES ('Dussa', ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)");
            $stmt_add_dussa->execute([$data->dussaOutput]);
            
            $pdo->commit();
            $response = ["status" => "success", "message" => "Production recorded"];
            break;

        case 'get_sales':
             $stmt = $pdo->query("SELECT so.id, so.customer_name, so.order_date, oi.product_name, oi.package_size, oi.quantity, oi.total_kg, oi.total_price FROM sales_orders so JOIN order_items oi ON so.id = oi.order_id ORDER BY so.order_date DESC, so.id DESC");
             $response = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;

        case 'add_order':
            if (empty($data->customerName) || empty($data->items)) {
                http_response_code(400);
                throw new Exception("Customer name and items are required.");
            }

            $pdo->beginTransaction();
            
            $grand_total = 0;
            foreach ($data->items as $item) {
                $item_obj = (object)$item;
                $grand_total += $item_obj->total_price;
            }

            $stmt_order = $pdo->prepare("INSERT INTO sales_orders (customer_name, order_date, grand_total) VALUES (?, ?, ?)");
            $stmt_order->execute([$data->customerName, $data->order_date, $grand_total]);
            $order_id = $pdo->lastInsertId();

            $stmt_items = $pdo->prepare("INSERT INTO order_items (order_id, product_name, package_size, quantity, total_kg, total_price) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt_stock = $pdo->prepare("UPDATE finished_goods SET quantity = quantity - ? WHERE name = ?");

            foreach ($data->items as $item) {
                 $item_obj = (object)$item;
                $stmt_items->execute([
                    $order_id,
                    $item_obj->product,
                    $item_obj->packageSize,
                    $item_obj->quantity,
                    $item_obj->total_kg,
                    $item_obj->total_price
                ]);
                
                $stmt_stock->execute([$item_obj->total_kg, $item_obj->product]);
            }

            $pdo->commit();
            $response = ["status" => "success", "message" => "Order created successfully", "invoice_id" => $order_id];
            break;

        case 'get_invoices':
            $response = $pdo->query("SELECT id, customer_name, order_date as invoice_date, grand_total FROM sales_orders ORDER BY order_date DESC, id DESC")->fetchAll();
            break;
            
        case 'get_invoice_details':
            $invoice_id = $data->id ?? null;
            if (!$invoice_id) throw new Exception("Invoice ID is required.");
            
            $invoice_stmt = $pdo->prepare("SELECT id, customer_name, order_date as invoice_date, grand_total FROM sales_orders WHERE id = ?");
            $invoice_stmt->execute([$invoice_id]);
            $invoice = $invoice_stmt->fetch();

            if ($invoice) {
                $items_stmt = $pdo->prepare("SELECT product_name, package_size, quantity, total_kg, total_price FROM order_items WHERE order_id = ?");
                $items_stmt->execute([$invoice_id]);
                $invoice['items'] = $items_stmt->fetchAll();
            }
            $response = $invoice;
            break;

        default:
            http_response_code(400);
            $response = ["status" => "error", "message" => "Unknown action"];
            break;
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    $response = ["status" => "error", "message" => "An error occurred: " . $e->getMessage(), "trace" => $e->getTraceAsString()];
}

echo json_encode($response);
?>
