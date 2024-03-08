
class Dino {
    constructor(game, playerId, playerNumber) {
        this.game = game;
        this.id = playerId;
        this.playerNumber = playerNumber
        this.dino = null    // dino sprite
        this.dinoColor = null
        this.nickname = ""
        this.score = 0
        this.x = 0
        this.sessionPlayerReference = db.ref(`session/${localStorage.getItem("sessionId")}/${this.id}`)
        this.is_jumping = false
        _loadPlayerData()
        _createSprite()
        _createPlayerName()
        _createColliderLine()
        _createJumpListener()
    }


    _loadPlayerData() {
        if (this.id.startsWith("guest_")) {
            this.sessionPlayerReference().once("value", function (userData) {
                this.dinoColor = userData.val().dino_color;
            });
            this.nickname = id
        } else if (id.length == 28) {
            db.ref(`user/${this.id}`).once("value", function (userData) {
                this.nickname = userData.val().nickname;
                this.dinoColor = userData.val().dino_color;
            });
        }
        console.log(`loaded player data for ${this.id}`)
    }

    _createSprite() {
        // TODO load sprite and paint with correct color
        this.dino = this.game.physics.add.sprite(START_DISTANCE_DINI + (this.playerNumber * TRANSLATION), 0, 'dinoSprite').setOrigin(0, 0);
        this.dino.setTintFill(this.dinoColor, this.dinoColor, this.dinoColor, this.dinoColor);
        this.dino.setCollideWorldBounds(true); //collisioni del dino con i bordi
        this.game.physics.add.collider(this.dino, this.line);
        this.dino.play("run");
        console.log(`created dino sprite data for ${this.id}`)
    }

    _createPlayerName(){
        this.game.add.text(START_DISTANCE_DINI + (this.playerNumber * TRANSLATION) - 200, START_HEIGHT - 20 + HEIGHT_SPACE * this.playerNumber, this.nickname, { fontFamily: 'Arial', fontSize: 20, color: '#000' });
        console.log(`created player name ${this.nickname} for ${this.id}`)
    }

    _createJumpListener() {
        this.sessionPlayerReference.on("child_changed", function (playerData) {
            var player_jump = playerData.val();
            if (player_jump && (playerData.ref_.path.pieces_)[3] == "is_jumping") {
                this.is_jumping = true
            }
        });
    }

    _createColliderLine() {
        let height = this.game.START_HEIGHT + (this.playerNumberi * game.HEIGHT_SPACE);
        this.line = this.game.add.zone(0, height, this.game.window.innerWidth, 1)
        this.game.colliderLines.add(line)
    }

    _updateGroundCollision() {
        this.sessionPlayerReference.update({ 'is_touchingDown': this.dino.body.touching.down })
    }

    assignMedal(medal) {
        if (!this.id.startsWith('guest_')) {
            //can save medal only for non-guest user
            db.ref(`user/${this.id}/medals`).push({ medal })
        }
    }

    saveScore() {
        if (!this.id.startsWith('guest_')) {
            //can save score only for non-guest user
            // db.ref(`user/${this.id}/medals`).push({medal})            
            db.ref(`user/${this.id}`).once("value", function (userData) {
                var savedScore = userData.val().best_score;
                if (score > savedScore) {
                    db.ref(`user/${this.id}`).update({
                        'best_score': score,
                    });
                }
            });
        }
    }

    /**
     * if the Dino is jumping (this.jumping = true)
     * play the animation and then reset the variable (local and in db)
     */
    doJump() {
        this.dino.play('jump')
        this.dino.setVelocityY(-950);
        this.dino.play("run");
        this.is_jumping = false
        this.sessionPlayerReference.update({ 'is_jumping': this.is_jumping });
    }


    die(){
        // TODO implement death, include instructions present in collideCactus
    }

    update() {
        // TODO update player dino sprite
        _updateGroundCollision()
        doJump()
    }
}

