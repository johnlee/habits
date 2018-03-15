<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
require './vendor/autoload.php';
require './db.php';
$app = new \Slim\App;
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});
// Add CORS Support
// $app->add(function ($req, $res, $next) {
//     $response = $next($req, $res);
//     return $response
//             ->withHeader('Access-Control-Allow-Origin', '*')
//             ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
//             ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
// });
$app->get('/', function(Request $request, Response $response){
    echo file_get_contents("habits.htm");
});
$app->get('/habits', function(Request $request, Response $response){
    $sql = "SELECT * FROM Habits ORDER BY `date` DESC";
    try{
        $db = new db();
        $db = $db->connect();
        $stmt = $db->query($sql);
        $habits = $stmt->fetchAll(PDO::FETCH_OBJ);
        echo json_encode($habits);
    } catch(PDOException $e){
        echo '{"status":"500","message":'.$e->getMessage().'}';
    }
});
$app->get('/habits/{date}', function(Request $request, Response $response){
    $id = $request->getAttribute('date');
    $sql = "SELECT * FROM Habits WHERE `date` = $id";
    try{
        $db = new db();
        $db = $db->connect();
        $stmt = $db->query($sql);
        $habit = $stmt->fetch(PDO::FETCH_OBJ);
        echo json_encode($habit);
    } catch(PDOException $e){
        echo '{"status":"500","message":'.$e->getMessage().'}';
    }
});
$app->post('/habits', function(Request $request, Response $response){
    $body = $request->getBody();
    $data = json_decode($body, true);
    $action = $data["action"];
    $date = $data["date"];
    date_default_timezone_set('America/Los_Angeles');
    $currentDateTime = date('c');
    switch ($action) {
        case "provoke":
            $sql = "INSERT INTO Habits (`date`,`provoke`,`succumb`) VALUES
                (:currentDate,1,0) ON DUPLICATE KEY UPDATE `provoke` = `provoke` + 1";
            try{
                $db = new db();
                $db = $db->connect();
                $stmt = $db->prepare($sql);
                $stmt->bindParam(':currentDate', $date);
                $stmt->execute();
                echo '{"status":"200","message":"Successfully added record"}';
            } catch(PDOException $e){
                echo '{"status":"500","message":'.$e->getMessage().'}';
            }
            break;
        case "succumb":
                $sql = "INSERT INTO Habits (`date`,`provoke`,`succumb`) VALUES
                (:currentDate,1,1) ON DUPLICATE KEY UPDATE `succumb` = `succumb` + 1";
            try{
                $db = new db();
                $db = $db->connect();
                $stmt = $db->prepare($sql);
                $stmt->bindParam(':currentDate', $date);
                $stmt->execute();
                echo '{"status":"200","message":"Successfully added record"}';
            } catch(PDOException $e){
                echo '{"status":"500","message":'.$e->getMessage().'}';
            }
            break;
        default:
            $newResponse = $response->withStatus(400);
            return $newResponse;
    }
});
$app->post('/habits/{date}', function(Request $request, Response $response){
    $date = $request->getAttribute('date');
    $body = $request->getBody();
    $data = json_decode($body, true);
    $provoke = $data["provoke"];
    $succumb = $data["succumb"];
    $sql = "REPLACE INTO Habits (`date`,`provoke`,`succumb`) VALUES (:currentDate,:provoke,:succumb)";
    try{
        $db = new db();
        $db = $db->connect();
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':currentDate', $date);
        $stmt->bindParam(':provoke', $provoke);
        $stmt->bindParam(':succumb', $succumb);
        $stmt->execute();
        echo '{"status":"200","message":"Successfully added record"}';
    } catch(PDOException $e){
        echo '{"status":"500","message":'.$e->getMessage().'}';
    }
});
$app->delete('/habits/{date}', function(Request $request, Response $response){
    $id = $request->getAttribute('date');
    echo 'Deleted Habit ' . $id;
});
$app->run();
?>