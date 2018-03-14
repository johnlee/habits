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
    $sql = "SELECT * FROM Daily ORDER BY `date` DESC";
    try{
        $db = new db();
        $db = $db->connect();
        $stmt = $db->query($sql);
        $habits = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($habits);
    } catch(PDOException $e){
        echo '{"status":"500","message":'.$e->getMessage().'}';
    }
});
$app->get('/habits/{date}', function(Request $request, Response $response){
    $id = $request->getAttribute('date');
    $sql = "SELECT * FROM Daily WHERE `date` = $id";
    try{
        $db = new db();
        $db = $db->connect();
        $stmt = $db->query($sql);
        $habit = $stmt->fetch(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($habit);
    } catch(PDOException $e){
        echo '{"status":"500","message":'.$e->getMessage().'}';
    }
});
$app->post('/habits', function(Request $request, Response $response){
    $body = $request->getBody();
    $data = json_decode($body, true);
    $action = $data["action"];
    $comments = $data["comments"];
    $date = $data["date"];
    date_default_timezone_set('America/Los_Angeles');
    $currentDateTime = date('c');
    switch ($action) {
        case "attempt":
            $sql = "INSERT INTO Attempts (`datetime`,`date`,`action`,`comments`) VALUES
                (:currentDateTime,:currentDate,:thisAction,:comments)";
            try{
                $db = new db();
                $db = $db->connect();
                $stmt = $db->prepare($sql);
                $stmt->bindParam(':currentDateTime', $currentDateTime);
                $stmt->bindParam(':currentDate', $date);
                $stmt->bindParam(':thisAction', $action);
                $stmt->bindParam(':comments', $comments);
                $stmt->execute();
                echo '{"status":"200","message":"Successfully added record"}';
            } catch(PDOException $e){
                echo '{"status":"500","message":'.$e->getMessage().'}';
            }
            $sql = "INSERT INTO Daily (`date`,`attempts`,`status`) VALUES
                (:currentDate,1,'success') ON DUPLICATE KEY UPDATE `attempts` = `attempts` + 1";
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
        case "fail":
            $sql = "INSERT INTO Daily (`date`,`attempts`,`status`) VALUES
                (:currentDate,1,'fail') ON DUPLICATE KEY UPDATE 
                `attempts` = `attempts` + 1, `status` = 'fail'";
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
        case "success":
            $sql = "INSERT INTO Daily (`date`,`attempts`,`status`) VALUES
                (:currentDate,0,'success') ON DUPLICATE KEY UPDATE `status` = 'success'";
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
$app->put('/habits/{date}', function(Request $request, Response $response){
    $id = $request->getAttribute('date');
    echo 'Updated Habit ' . $id;
});
$app->delete('/habits/{date}', function(Request $request, Response $response){
    $id = $request->getAttribute('date');
    echo 'Deleted Habit ' . $id;
});
$app->run();
?>