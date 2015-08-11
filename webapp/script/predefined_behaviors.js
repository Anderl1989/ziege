PREDEFINED_PATTERNS = {
	"gravity": {
		name: "Gravitation",
		events: [
			{
				type: "always",
			},
		],
		reactions: [
			{
				type: "accelerationY",
				param1: "set",
				param2: "custom",
				param3: 10,
			},
		],
	},
	"goRight": {
		name: "Nach rechts gehen",
		events: [
			{
				type: "mirrored",
				param1: "x",
				param2: "false",
			},
		],
		reactions: [
			{
				type: "velocityX",
				param1: "set",
				param2: "custom",
				param3: 10,
			},
		],
	},
	"goLeft": {
		name: "Nach rechts gehen",
		events: [
			{
				type: "mirrored",
				param1: "x",
				param2: "true",
			},
		],
		reactions: [
			{
				type: "velocityX",
				param1: "set",
				param2: "custom",
				param3: -10,
			},
		],
	},
	"goRightFast": {
		name: "Nach rechts gehen",
		events: [
			{
				type: "mirrored",
				param1: "x",
				param2: "false",
			},
		],
		reactions: [
			{
				type: "velocityX",
				param1: "set",
				param2: "custom",
				param3: 30,
			},
		],
	},
	"goLeftFast": {
		name: "Nach rechts gehen",
		events: [
			{
				type: "mirrored",
				param1: "x",
				param2: "true",
			},
		],
		reactions: [
			{
				type: "velocityX",
				param1: "set",
				param2: "custom",
				param3: -30,
			},
		],
	},
	"turnOnRightAbyss": {
		name: "Am rechten Abgrund umkehren",
		events: [
			{
				type: "abyss",
				param1: "bottomRight",
			},
		],
		reactions: [
			{
				type: "mirror",
				param1: "x",
				param2: "true",
			},
		],
	},
	"turnOnLeftAbyss": {
		name: "Am rechten Abgrund umkehren",
		events: [
			{
				type: "abyss",
				param1: "bottomLeft",
			},
		],
		reactions: [
			{
				type: "mirror",
				param1: "x",
				param2: "false",
			},
		],
	},
	"turnOnRightWall": {
		name: "An rechter Wand umkehren",
		events: [
			{
				type: "collision",
				param1: "right",
				param2: "box",
			},
		],
		reactions: [
			{
				type: "mirror",
				param1: "x",
				param2: "true",
			},
		],
	},
	"turnOnLeftWall": {
		name: "An linker Wand umkehren",
		events: [
			{
				type: "collision",
				param1: "left",
				param2: "box",
			},
		],
		reactions: [
			{
				type: "mirror",
				param1: "x",
				param2: "false",
			},
		],
	},
	"jumpOnAbyss": {
		name: "Am Abgrund springen",
		events: [
			{
				type: "abyss",
				param1: "bottom",
			},
		],
		reactions: [
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: -20,
			},
		],
	},
	"dieOnPlayerFromTopAndScore": {
		name: "Stirbt wenn Spieler von oben kommt",
		events: [
			{
				type: "collision",
				param1: "top",
				param2: "entity",
				param3: "player",
			},
		],
		reactions: [
			{
				type: "disappear",
			},
			{
				type: "score",
				param1: "add",
				param2: "custom",
				param3: 5,
			},
			{
				type: "spawn",
				param1: "game.pow",
			},
		],
	},
	"dieOnBulletAndScore": {
		name: "Stirbt wenn von Kugel getroffen",
		events: [
			{
				type: "collision",
				param1: "anywhere",
				param2: "entity",
				param3: "bullet",
			},
		],
		reactions: [
			{
				type: "disappear",
			},
			{
				type: "score",
				param1: "add",
				param2: "custom",
				param3: 3,
			},
			{
				type: "spawn",
				param1: "game.pow",
			},
		],
	},
	"resetOnLeaveScreen": {
		name: "Stirbt wenn Spielfeld nach unten verlassen wird",
		events: [
			{
				type: "outOfScreen",
				param1: "bottom",
			},
		],
		reactions: [
			{
				type: "restore",
			},
			{
				type: "spawn",
				param1: "game.bam",
			},
		],
	},
	"resetOnEnemyAndLowerScore": {
		name: "Setzt Spiel zurück wenn Gegner berührt wird und verringert score",
		events: [
			{
				type: "collision",
				param1: "side",
				param2: "entity",
				param3: "enemy",
			},
		],
		reactions: [
			{
				type: "restore",
			},
			{
				type: "score",
				param1: "subtract",
				param2: "custom",
				param3: 10,
			},
			{
				type: "spawn",
				param1: "game.bam",
			},
		],
	},
	"dieOnEnemy": {
		name: "Stirbt wenn Gegner berührt wird",
		events: [
			{
				type: "collision",
				param1: "anywhere",
				param2: "entity",
				param3: "enemy",
			},
		],
		reactions: [
			{
				type: "disappear",
			},
		],
	},
	"dieOnWall": {
		name: "Stirbt wenn Wand berührt wird",
		events: [
			{
				type: "collision",
				param1: "anywhere",
				param2: "box",
			},
		],
		reactions: [
			{
				type: "disappear",
			},
		],
	},
	"goRightOnKey": {
		name: "Nach rechts gehen bei cursortaste",
		events: [
			{
				type: "keyPressed",
				param1: 39,
			},
		],
		reactions: [
			{
				type: "velocityX",
				param1: "set",
				param2: "custom",
				param3: 20,
			},
			{
				type: "mirror",
				param1: "x",
				param2: "false",
			},
		],
	},
	"goRightOnKeyAlt": {
		name: "Nach rechts gehen bei d",
		events: [
			{
				type: "keyPressed",
				param1: 68,
			},
		],
		reactions: [
			{
				type: "velocityX",
				param1: "set",
				param2: "custom",
				param3: 20,
			},
			{
				type: "mirror",
				param1: "x",
				param2: "false",
			},
		],
	},
	"goLeftOnKey": {
		name: "Nach links gehen bei cursortaste",
		events: [
			{
				type: "keyPressed",
				param1: 37,
			},
		],
		reactions: [
			{
				type: "velocityX",
				param1: "set",
				param2: "custom",
				param3: -20,
			},
			{
				type: "mirror",
				param1: "x",
				param2: "true",
			},
		],
	},
	"goLeftOnKeyAlt": {
		name: "Nach links gehen bei a",
		events: [
			{
				type: "keyPressed",
				param1: 65,
			},
		],
		reactions: [
			{
				type: "velocityX",
				param1: "set",
				param2: "custom",
				param3: -20,
			},
			{
				type: "mirror",
				param1: "x",
				param2: "true",
			},
		],
	},
	"goUpOnKey": {
		name: "Nach oben gehen bei cursortaste",
		events: [
			{
				type: "keyPressed",
				param1: 38,
			},
		],
		reactions: [
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: -20,
			},
		],
	},
	"goDownOnKey": {
		name: "Nach unten gehen bei cursortaste",
		events: [
			{
				type: "keyPressed",
				param1: 40,
			},
		],
		reactions: [
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: 20,
			},
		],
	},
	"jumpOnKey": {
		name: "Springen bei cursortaste",
		events: [
			{
				type: "collision",
				param1: "bottom",
				param2: "box",
			},
			{
				type: "keyPressed",
				param1: 38,
			},
		],
		reactions: [
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: -33,
			},
		],
	},
	"jumpOnKeyAlt": {
		name: "Springen bei w",
		events: [
			{
				type: "collision",
				param1: "bottom",
				param2: "box",
			},
			{
				type: "keyPressed",
				param1: 87,
			},
		],
		reactions: [
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: -33,
			},
		],
	},
	"jumpAlwaysOnKey": {
		name: "Springen bei cursortaste (auch in der Luft)",
		events: [
			{
				type: "keyPressed",
				param1: 38,
			},
		],
		reactions: [
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: -33,
			},
		],
	},
	"jumpOnKeyOnPlatform": {
		name: "Springen bei cursortaste wenn auf platform",
		events: [
			{
				type: "collision",
				param1: "bottom",
				param2: "entity",
				param3: "platform",
			},
			{
				type: "keyPressed",
				param1: 38,
			},
		],
		reactions: [
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: -31,
			},
		],
	},
	"jumpOnKeyOnPlatformAlt": {
		name: "Springen bei w wenn auf platform",
		events: [
			{
				type: "collision",
				param1: "bottom",
				param2: "entity",
				param3: "platform",
			},
			{
				type: "keyPressed",
				param1: 87,
			},
		],
		reactions: [
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: -31,
			},
		],
	},
	"dieOnPlayerAndScore": {
		name: "Stirbt wenn von Spieler berührt",
		events: [
			{
				type: "collision",
				param1: "anywhere",
				param2: "entity",
				param3: "player",
			},
		],
		reactions: [
			{
				type: "disappear",
			},
			{
				type: "score",
				param1: "add",
				param2: "custom",
				param3: 10,
			},
		],
	},
	"saveOnPlayer": {
		name: "Speichert spielstand wenn von Spieler berührt",
		events: [
			{
				type: "collision",
				param1: "anywhere",
				param2: "entity",
				param3: "player",
			},
		],
		reactions: [
			{
				type: "save",
			},
		],
	},
	"winOnPlayer": {
		name: "Beendet Spiel wenn von Spieler berührt",
		events: [
			{
				type: "collision",
				param1: "anywhere",
				param2: "entity",
				param3: "player",
			},
		],
		reactions: [
			{
				type: "endGame",
				param1: "Spiel gewonnen!",
			},
		],
	},
	"noMovementOnNoKeyX": {
		name: "Lässt Spieler still stehen",
		events: [
			{
				type: "always",
			},
		],
		reactions: [
			{
				type: "velocityX",
				param1: "set",
				param2: "custom",
				param3: 0,
			},
		],
	},
	"noMovementOnNoKeyY": {
		name: "Lässt Spieler still stehen",
		events: [
			{
				type: "always",
			},
		],
		reactions: [
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: 0,
			},
		],
	},
	"noMovementOnNoKeyXY": {
		name: "Lässt Spieler still stehen",
		events: [
			{
				type: "always",
			},
		],
		reactions: [
			{
				type: "velocityX",
				param1: "set",
				param2: "custom",
				param3: 0,
			},
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: 0,
			},
		],
	},
	"moveWithPlatform": {
		name: "Springen bei cursortaste wenn auf platform",
		events: [
			{
				type: "collision",
				param1: "bottom",
				param2: "entity",
				param3: "platform",
			},
			{
				type: "attribute",
				param1: "onPlatform",
				param2: "e",
				param3: 1,
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "dX",
				param2: "set",
				param3: "opponentValue",
				param4: "positionX",
			},
			{
				type: "attribute",
				param1: "dX",
				param2: "subtract",
				param3: "attribute",
				param4: "prevPlatformX",
			},
			{
				type: "positionX",
				param1: "add",
				param2: "attribute",
				param3: "dX",
			},
		],
	},
	"moveWithPlatformSetPrevious": {
		name: "Springen bei cursortaste wenn auf platform",
		events: [
			{
				type: "collision",
				param1: "bottom",
				param2: "entity",
				param3: "platform",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "prevPlatformX",
				param2: "set",
				param3: "opponentValue",
				param4: "positionX",
			},
			{
				type: "attribute",
				param1: "onPlatform",
				param2: "set",
				param3: "custom",
				param4: 1,
			},
		],
	},
	"moveWithPlatformReset": {
		name: "Springen bei cursortaste wenn auf platform",
		events: [
			{
				type: "noCollision",
				param1: "entity",
				param2: "platform",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "onPlatform",
				param2: "set",
				param3: "custom",
				param4: 0,
			},
		],
	},
	"startAnimation": {
		name: "Startet Animation",
		events: [
			{
				type: "always",
			},
		],
		reactions: [
			{
				type: "startAnimation",
			},
		],
	},
	"stopAnimationOnIdle": {
		name: "Stoppt Animation bei Stillstand",
		events: [
			{
				type: "velocity",
				param1: "x",
				param2: "e",
				param3: 0,
			},
		],
		reactions: [
			{
				type: "stopAnimation",
			},
			{
				type: "frame",
				param1: "set",
				param2: "custom",
				param3: 0,
			},
		],
	},
	"initShootTimer": {
		name: "Schuss Timer initialisieren",
		events: [
			{
				type: "init",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "shootTimer",
				param2: "set",
				param3: "custom",
				param4: 0,
			},
		],
	},
	"initShootTimerAlt": {
		name: "Schuss Timer initialisieren",
		events: [
			{
				type: "init",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "shootTimerAlt",
				param2: "set",
				param3: "custom",
				param4: 0,
			},
		],
	},
	"shootOnKey": {
		name: "Schießen bei Tastendruck (Leer)",
		events: [
			{
				type: "keyPressed",
				param1: 32,
			},
			{
				type: "attribute",
				param1: "shootTimer",
				param2: "le",
				param3: 0,
			},
		],
		reactions: [
			{
				type: "spawn",
				param1: "game.bullet",
			},
			{
				type: "attribute",
				param1: "shootTimer",
				param2: "set",
				param3: "custom",
				param4: 300,
			},
		],
	},
	"shootOnKeyAlt": {
		name: "Schießen bei Tastendruck (Shift)",
		events: [
			{
				type: "keyPressed",
				param1: 16,
			},
			{
				type: "attribute",
				param1: "shootTimerAlt",
				param2: "le",
				param3: 0,
			},
		],
		reactions: [
			{
				type: "spawn",
				param1: "game.bullet",
			},
			{
				type: "attribute",
				param1: "shootTimerAlt",
				param2: "set",
				param3: "custom",
				param4: 300,
			},
		],
	},
	"decreaseShootTimer": {
		name: "Schuss Timer herunterzählen",
		events: [
			{
				type: "always",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "shootTimer",
				param2: "subtract",
				param3: "value",
				param4: "millis",
			},
		],
	},
	"decreaseShootTimerAlt": {
		name: "Schuss Timer herunterzählen",
		events: [
			{
				type: "always",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "shootTimerAlt",
				param2: "subtract",
				param3: "value",
				param4: "millis",
			},
		],
	},
	"initBullet":{
		name: "Schuss initialisieren",
		events: [
			{
				type: "init",
			},
		],
		reactions: [
			{
				type: "positionX",
				param1: "add",
				param2: "custom",
				param3: 16,
			},
			{
				type: "positionY",
				param1: "add",
				param2: "custom",
				param3: 16,
			},
		],
	},
	"goUp": {
		name: "Nach oben bewegen",
		events: [
			{
				type: "attribute",
				param1: "up",
				param2: "e",
				param3: 1,
			},
		],
		reactions: [
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: -10,
			},
		],
	},
	"goDown": {
		name: "Nach unten bewegen",
		events: [
			{
				type: "attribute",
				param1: "up",
				param2: "e",
				param3: 0,
			},
		],
		reactions: [
			{
				type: "velocityY",
				param1: "set",
				param2: "custom",
				param3: 10,
			},
		],
	},
	"initUpAttribute":{
		name: "Initialisiert das up attribut",
		events: [
			{
				type: "init",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "up",
				param2: "set",
				param3: "custom",
				param4: 0,
			},
		],
	},
	"turnOnCeil": {
		name: "An Decke umkehren",
		events: [
			{
				type: "collision",
				param1: "top",
				param2: "box",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "up",
				param2: "set",
				param3: "custom",
				param4: 0,
			},
		],
	},
	"turnOnFloor": {
		name: "Am Boden umkehren",
		events: [
			{
				type: "collision",
				param1: "bottom",
				param2: "box",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "up",
				param2: "set",
				param3: "custom",
				param4: 1,
			},
		],
	},
	"resetOnPlayerSquash": {
		name: "Tod wenn Spieler zerdrückt wird",
		events: [
			{
				type: "collision",
				param1: "vertical",
				param2: "box",
			},
			{
				type: "collision",
				param1: "vertical",
				param2: "entity",
				param3: "platform",
			},
		],
		reactions: [
			{
				type: "restore",
			},
			{
				type: "spawn",
				param1: "game.bam",
			},
		],
	},
	"initXStartValue":{
		name: "Initialisiert x attribut",
		events: [
			{
				type: "init",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "startX",
				param2: "set",
				param3: "value",
				param4: "positionX",
			},
		],
	},
	"updateXValue":{
		name: "Aktualisiere x attribut",
		events: [
			{
				type: "always",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "dX",
				param2: "set",
				param3: "value",
				param4: "positionX",
			},
			{
				type: "attribute",
				param1: "dX",
				param2: "subtract",
				param3: "attribute",
				param4: "startX",
			},
		],
	},
	"turnOnXValueRight": {
		name: "nach rechts bewegen nach gewisser distanz",
		events: [
			{
				type: "attribute",
				param1: "dX",
				param2: "l",
				param3: -64,
			},
		],
		reactions: [
			{
				type: "mirror",
				param1: "x",
				param2: "false",
			},
		],
	},
	"turnOnXValueLeft": {
		name: "nach rechts bewegen nach gewisser distanz",
		events: [
			{
				type: "attribute",
				param1: "dX",
				param2: "g",
				param3: 64,
			},
		],
		reactions: [
			{
				type: "mirror",
				param1: "x",
				param2: "true",
			},
		],
	},
	"resetOnLava":{
		name: "Reset wenn Lava/Stacheln berührt werden",
		events: [
			{
				type: "collision",
				param1: "anywhere",
				param2: "entity",
				param3: "lava",
			},
		],
		reactions: [
			{
				type: "restore",
			},
			{
				type: "spawn",
				param1: "game.bam",
			},
		],
	},
	"initEffectTimer": {
		name: "Effect Timer initialisieren",
		events: [
			{
				type: "init",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "effectTimer",
				param2: "set",
				param3: "custom",
				param4: 500,
			},
		],
	},
	"decreaseEffectTimer": {
		name: "Effect Timer herunterzählen",
		events: [
			{
				type: "always",
			},
		],
		reactions: [
			{
				type: "attribute",
				param1: "effectTimer",
				param2: "subtract",
				param3: "value",
				param4: "millis",
			},
		],
	},
	"initEffect":{
		name: "Effect initialisieren",
		events: [
			{
				type: "init",
			},
		],
		reactions: [
			{
				type: "positionX",
				param1: "add",
				param2: "custom",
				param3: 16,
			},
			{
				type: "positionY",
				param1: "add",
				param2: "custom",
				param3: 16,
			},
		],
	},
	"setEffectAttrs": {
		name: "Setzt Effekt attribute",
		events: [
			{
				type: "always",
			},
		],
		reactions: [
			{
				type: "mirror",
				param1: "x",
				param2: "false",
			},
			{
				type: "mirror",
				param1: "y",
				param2: "false",
			},
		],
	},
	"dieOnEffectTimer": {
		name: "Stirbt wenn Effect Timer kleiner/gleich 0",
		events: [
			{
				type: "attribute",
				param1: "effectTimer",
				param2: "le",
				param3: 0,
			},
		],
		reactions: [
			{
				type: "disappear",
			},
		],
	},
};

PREDEFINED_BEHAVIORS = {
	"walking_enemy": {
		name: "Gegner (laufend)",
		group: "enemy",
		rigid: false,
		colliding: true,
		attachCamera: false,
		patterns: [
			PREDEFINED_PATTERNS["gravity"],
			PREDEFINED_PATTERNS["goRight"],
			PREDEFINED_PATTERNS["goLeft"],
			PREDEFINED_PATTERNS["turnOnRightAbyss"],
			PREDEFINED_PATTERNS["turnOnLeftAbyss"],
			PREDEFINED_PATTERNS["turnOnRightWall"],
			PREDEFINED_PATTERNS["turnOnLeftWall"],
			PREDEFINED_PATTERNS["dieOnPlayerFromTopAndScore"],
			PREDEFINED_PATTERNS["dieOnBulletAndScore"],
		],
		zIndex: 80,
		showInMenu: true,
		menuGroup: "Gegner",
	},
	"jumping_enemy": {
		name: "Gegner (springend)",
		group: "enemy",
		rigid: false,
		colliding: true,
		attachCamera: false,
		patterns: [
			PREDEFINED_PATTERNS["gravity"],
			PREDEFINED_PATTERNS["goRight"],
			PREDEFINED_PATTERNS["goLeft"],
			PREDEFINED_PATTERNS["jumpOnAbyss"],
			PREDEFINED_PATTERNS["turnOnRightWall"],
			PREDEFINED_PATTERNS["turnOnLeftWall"],
			PREDEFINED_PATTERNS["dieOnPlayerFromTopAndScore"],
			PREDEFINED_PATTERNS["dieOnBulletAndScore"],
		],
		zIndex: 80,
		showInMenu: true,
		menuGroup: "Gegner",
	},
	"flying_enemy": {
		name: "Gegner (fliegend)",
		group: "enemy",
		rigid: false,
		colliding: true,
		attachCamera: false,
		patterns: [
			PREDEFINED_PATTERNS["goRight"],
			PREDEFINED_PATTERNS["goLeft"],
			PREDEFINED_PATTERNS["initXStartValue"],
			PREDEFINED_PATTERNS["updateXValue"],
			PREDEFINED_PATTERNS["turnOnXValueRight"],
			PREDEFINED_PATTERNS["turnOnXValueLeft"],
			PREDEFINED_PATTERNS["turnOnRightWall"],
			PREDEFINED_PATTERNS["turnOnLeftWall"],
			PREDEFINED_PATTERNS["dieOnPlayerFromTopAndScore"],
			PREDEFINED_PATTERNS["dieOnBulletAndScore"],
		],
		zIndex: 80,
		showInMenu: true,
		menuGroup: "Gegner",
	},
	"player": {
		name: "Spieler (springend)",
		group: "player",
		rigid: false,
		colliding: true,
		attachCamera: true,
		patterns: [
			PREDEFINED_PATTERNS["gravity"],
			PREDEFINED_PATTERNS["noMovementOnNoKeyX"],
			PREDEFINED_PATTERNS["goRightOnKey"],
			PREDEFINED_PATTERNS["goLeftOnKey"],
			PREDEFINED_PATTERNS["jumpOnKey"],
			PREDEFINED_PATTERNS["jumpOnKeyOnPlatform"],
			PREDEFINED_PATTERNS["resetOnEnemyAndLowerScore"],
			PREDEFINED_PATTERNS["moveWithPlatform"],
			PREDEFINED_PATTERNS["moveWithPlatformSetPrevious"],
			PREDEFINED_PATTERNS["moveWithPlatformReset"],
			PREDEFINED_PATTERNS["startAnimation"],
			PREDEFINED_PATTERNS["stopAnimationOnIdle"],
			PREDEFINED_PATTERNS["initShootTimer"],
			PREDEFINED_PATTERNS["shootOnKey"],
			PREDEFINED_PATTERNS["decreaseShootTimer"],
			PREDEFINED_PATTERNS["resetOnLeaveScreen"],
			//PREDEFINED_PATTERNS["resetOnPlayerSquash"],
			PREDEFINED_PATTERNS["resetOnLava"],
		],
		zIndex: 100,
		showInMenu: true,
		menuGroup: "Spieler",
	},
	"player_alt": {
		name: "Spieler 2 (springend)",
		group: "player",
		rigid: false,
		colliding: true,
		attachCamera: true,
		patterns: [
			PREDEFINED_PATTERNS["gravity"],
			PREDEFINED_PATTERNS["noMovementOnNoKeyX"],
			PREDEFINED_PATTERNS["goRightOnKeyAlt"],
			PREDEFINED_PATTERNS["goLeftOnKeyAlt"],
			PREDEFINED_PATTERNS["jumpOnKeyAlt"],
			PREDEFINED_PATTERNS["jumpOnKeyOnPlatformAlt"],
			PREDEFINED_PATTERNS["resetOnEnemyAndLowerScore"],
			PREDEFINED_PATTERNS["moveWithPlatform"],
			PREDEFINED_PATTERNS["moveWithPlatformSetPrevious"],
			PREDEFINED_PATTERNS["moveWithPlatformReset"],
			PREDEFINED_PATTERNS["startAnimation"],
			PREDEFINED_PATTERNS["stopAnimationOnIdle"],
			PREDEFINED_PATTERNS["initShootTimerAlt"],
			PREDEFINED_PATTERNS["shootOnKeyAlt"],
			PREDEFINED_PATTERNS["decreaseShootTimerAlt"],
			PREDEFINED_PATTERNS["resetOnLeaveScreen"],
			//PREDEFINED_PATTERNS["resetOnPlayerSquash"],
			PREDEFINED_PATTERNS["resetOnLava"],
		],
		zIndex: 100,
		showInMenu: true,
		menuGroup: "Spieler",
	},
	"player_space": {
		name: "Spieler (frei beweglich)",
		group: "player",
		rigid: false,
		colliding: true,
		attachCamera: true,
		patterns: [
			PREDEFINED_PATTERNS["noMovementOnNoKeyXY"],
			PREDEFINED_PATTERNS["goRightOnKey"],
			PREDEFINED_PATTERNS["goLeftOnKey"],
			PREDEFINED_PATTERNS["goUpOnKey"],
			PREDEFINED_PATTERNS["goDownOnKey"],
			PREDEFINED_PATTERNS["resetOnEnemyAndLowerScore"],
			PREDEFINED_PATTERNS["startAnimation"],
			PREDEFINED_PATTERNS["initShootTimer"],
			PREDEFINED_PATTERNS["shootOnKey"],
			PREDEFINED_PATTERNS["decreaseShootTimer"],
			PREDEFINED_PATTERNS["resetOnLeaveScreen"],
			//PREDEFINED_PATTERNS["resetOnPlayerSquash"],
			PREDEFINED_PATTERNS["resetOnLava"],
		],
		zIndex: 100,
		showInMenu: true,
		menuGroup: "Spieler",
	},
	"player_space_auto": {
		name: "Spieler (frei beweglich, automatisch)",
		group: "player",
		rigid: false,
		colliding: true,
		attachCamera: true,
		patterns: [
			PREDEFINED_PATTERNS["noMovementOnNoKeyY"],
			PREDEFINED_PATTERNS["goRight"],
			PREDEFINED_PATTERNS["goUpOnKey"],
			PREDEFINED_PATTERNS["goDownOnKey"],
			PREDEFINED_PATTERNS["resetOnEnemyAndLowerScore"],
			PREDEFINED_PATTERNS["startAnimation"],
			PREDEFINED_PATTERNS["initShootTimer"],
			PREDEFINED_PATTERNS["shootOnKey"],
			PREDEFINED_PATTERNS["decreaseShootTimer"],
			PREDEFINED_PATTERNS["resetOnLeaveScreen"],
			//PREDEFINED_PATTERNS["resetOnPlayerSquash"],
			PREDEFINED_PATTERNS["resetOnLava"],
		],
		zIndex: 100,
		showInMenu: true,
		menuGroup: "Spieler",
	},
	"player_flappy": {
		name: "Spieler (fliegend)",
		group: "player",
		rigid: false,
		colliding: true,
		attachCamera: true,
		patterns: [
			PREDEFINED_PATTERNS["gravity"],
			PREDEFINED_PATTERNS["noMovementOnNoKeyX"],
			PREDEFINED_PATTERNS["goRightOnKey"],
			PREDEFINED_PATTERNS["goLeftOnKey"],
			PREDEFINED_PATTERNS["jumpAlwaysOnKey"],
			PREDEFINED_PATTERNS["resetOnEnemyAndLowerScore"],
			PREDEFINED_PATTERNS["moveWithPlatform"],
			PREDEFINED_PATTERNS["moveWithPlatformSetPrevious"],
			PREDEFINED_PATTERNS["moveWithPlatformReset"],
			PREDEFINED_PATTERNS["startAnimation"],
			PREDEFINED_PATTERNS["stopAnimationOnIdle"],
			PREDEFINED_PATTERNS["initShootTimer"],
			PREDEFINED_PATTERNS["shootOnKey"],
			PREDEFINED_PATTERNS["decreaseShootTimer"],
			PREDEFINED_PATTERNS["resetOnLeaveScreen"],
			//PREDEFINED_PATTERNS["resetOnPlayerSquash"],
			PREDEFINED_PATTERNS["resetOnLava"],
		],
		zIndex: 100,
		showInMenu: true,
		menuGroup: "Spieler",
	},
	"player_flappy_auto": {
		name: "Spieler (fliegend, automatisch)",
		group: "player",
		rigid: false,
		colliding: true,
		attachCamera: true,
		patterns: [
			PREDEFINED_PATTERNS["gravity"],
			PREDEFINED_PATTERNS["goRight"],
			PREDEFINED_PATTERNS["jumpAlwaysOnKey"],
			PREDEFINED_PATTERNS["resetOnEnemyAndLowerScore"],
			PREDEFINED_PATTERNS["moveWithPlatform"],
			PREDEFINED_PATTERNS["moveWithPlatformSetPrevious"],
			PREDEFINED_PATTERNS["moveWithPlatformReset"],
			PREDEFINED_PATTERNS["startAnimation"],
			PREDEFINED_PATTERNS["initShootTimer"],
			PREDEFINED_PATTERNS["shootOnKey"],
			PREDEFINED_PATTERNS["decreaseShootTimer"],
			PREDEFINED_PATTERNS["resetOnLeaveScreen"],
			//PREDEFINED_PATTERNS["resetOnPlayerSquash"],
			PREDEFINED_PATTERNS["resetOnLava"],
		],
		zIndex: 100,
		showInMenu: true,
		menuGroup: "Spieler",
	},
	"bullet": {
		name: "Patronenkugel",
		group: "bullet",
		rigid: false,
		colliding: true,
		attachCamera: false,
		patterns: [
			PREDEFINED_PATTERNS["initBullet"],
			PREDEFINED_PATTERNS["goRightFast"],
			PREDEFINED_PATTERNS["goLeftFast"],
			PREDEFINED_PATTERNS["dieOnEnemy"],
			PREDEFINED_PATTERNS["dieOnWall"],
		],
		zIndex: 110,
		showInMenu: false,
	},
	"collectable": {
		name: "Sammelbares Objekt",
		group: "collectable",
		rigid: false,
		colliding: false,
		attachCamera: false,
		patterns: [
			PREDEFINED_PATTERNS["dieOnPlayerAndScore"],
		],
		zIndex: 70,
		showInMenu: true,
		menuGroup: "Weltelemente",
	},
	"checkpoint": {
		name: "Checkpoint",
		group: "checkpoint",
		rigid: false,
		colliding: false,
		attachCamera: false,
		patterns: [
			PREDEFINED_PATTERNS["saveOnPlayer"],
		],
		zIndex: 90,
		showInMenu: true,
		menuGroup: "Weltelemente",
	},
	"goal": {
		name: "Ziel",
		group: "checkpoint",
		rigid: false,
		colliding: false,
		attachCamera: false,
		patterns: [
			PREDEFINED_PATTERNS["winOnPlayer"],
		],
		zIndex: 60,
		showInMenu: true,
		menuGroup: "Weltelemente",
	},
	"platform": {
		name: "Plattform (unbeweglich)",
		group: "platform",
		rigid: true,
		colliding: false,
		attachCamera: false,
		patterns: [],
		zIndex: 90,
		showInMenu: true,
		menuGroup: "Weltelemente",
	},
	"ambient_bg": {
		name: "Ambiente (Hintergrund)",
		group: "ambient",
		rigid: false,
		colliding: false,
		attachCamera: false,
		patterns: [],
		zIndex: 0,
		showInMenu: true,
		menuGroup: "Weltelemente",
	},
	"ambient_fg": {
		name: "Ambiente (Vordergrund)",
		group: "ambient",
		rigid: false,
		colliding: false,
		attachCamera: false,
		patterns: [],
		zIndex: 1000,
		showInMenu: true,
		menuGroup: "Weltelemente",
	},
	"moving_platform": {
		name: "Plattform (beweglich, horizontal)",
		group: "platform",
		rigid: true,
		colliding: true,
		attachCamera: false,
		patterns: [
			PREDEFINED_PATTERNS["goRight"],
			PREDEFINED_PATTERNS["goLeft"],
			PREDEFINED_PATTERNS["turnOnRightWall"],
			PREDEFINED_PATTERNS["turnOnLeftWall"],
		],
		zIndex: 90,
		showInMenu: true,
		menuGroup: "Weltelemente",
	},
	"moving_platform_vertical": {
		name: "Plattform (beweglich, vertikal)",
		group: "platform",
		rigid: true,
		colliding: true,
		attachCamera: false,
		patterns: [
			PREDEFINED_PATTERNS["initUpAttribute"],
			PREDEFINED_PATTERNS["goUp"],
			PREDEFINED_PATTERNS["goDown"],
			PREDEFINED_PATTERNS["turnOnFloor"],
			PREDEFINED_PATTERNS["turnOnCeil"],
		],
		zIndex: 90,
		showInMenu: true,
		menuGroup: "Weltelemente",
	},
	"lava": {
		name: "Todesfalle (Lava, Stacheln)",
		group: "lava",
		rigid: false,
		colliding: false,
		attachCamera: false,
		patterns: [],
		zIndex: 120,
		showInMenu: true,
		menuGroup: "Gegner",
	},
	"effect": {
		name: "Effekt",
		group: "effect",
		rigid: false,
		colliding: false,
		attachCamera: false,
		patterns: [
			PREDEFINED_PATTERNS["initEffectTimer"],
			PREDEFINED_PATTERNS["setEffectAttrs"],
			PREDEFINED_PATTERNS["initEffect"],
			PREDEFINED_PATTERNS["decreaseEffectTimer"],
			PREDEFINED_PATTERNS["dieOnEffectTimer"],
		],
		zIndex: 200,
		showInMenu: false,
	},
};