<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>Login</title>
</head>
<body>
    <div class="modal" style="display: block;">
        <div class="modal-content">
            <h2>Login</h2>
            <?php if (isset($error)): ?>
                <p style="color: red;"><?php echo $error; ?></p>
            <?php endif; ?>
            <form method="POST" action="index.php?page=login">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
                
                <label for="password">Password (YYYY-MM-DD)</label>
                <input type="text" id="password" name="password" required>
                
                <button type="submit">Login</button>
            </form>
        </div>
    </div>
</body>
</html>