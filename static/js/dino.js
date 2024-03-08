
class Dino {
    constructor(game, playerId, playerNumber) {
        this.game = game;
        // TODO load data from fb
        this.id = playerId;
        this.dino = null    // dino sprite
        this.dinoColor = null
        this.nickname = ""
        this.score = 0
        this.x = 0
        this.sessionPlayerReference = db.ref(`session/${localStorage.getItem("sessionId")}/${this.id}`)
        this.is_jumping = false
        _loadDino()
        _createColliderLine()
        _createJumpListener()
    }


    _loadDino() { 
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

    _createSprite() {
        // TODO load sprite and paint with correct color
        this.dino = 'TODO SPRITE'
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
        this.line = gameRef.add.zone(0, height, this.game.window.innerWidth, 1)
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

    update() {
        // TODO update player dino sprite
        _updateGroundCollision()
        doJump()
    }
}

