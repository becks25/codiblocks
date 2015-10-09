app.factory('SpellFactory', function(TilesizeFactory){
	// List of valid commands
  //var CODES = ['move', 'if', 'loop', 'pickUp', 'give', 'ask', 'tell'];

  class Spell {
  	constructor(level){
  		this.level = level;
	    this.map = level.map;
	    this.key = level.key;
	    this.avatar = this.map.getAvatar();
	    this.currentCommand = null;
	    //this.reset();
	    // this.reload();
  	}

	reset (){
		// this.locks = 0;
		this.ok = true;
		this.running = false;
		this.errors = {};
		this.commands = [];
		this.map.resetMap();
		this.avatar = this.map.getAvatar();
		this.level.resetRequirements();
		if(this.currentCommand) this.currentCommand = null;
	}

	lock (){
		this.locks += 1;
	}

	unlock (){
		this.locks -= 1;
		if (this.locks === 0) {
		  this.cycle(this.avatar.position);
		}
	}

	// reload(){
	// 	var state = Level.map;
	// 	$('#spell-box').val(state.program || '');
	// 	$('#spell-box').focus();
	// }

	// save(){
	// 	var state = Level.getState(this.key);
	// 	state.program = $('#spell-box').val();
	// 	Level.setState(this.key, state);
	// }

	//runs the whole program, acts if solved/unsolved
	run(argArr){
		// this.save();
		this.reset();
		// this.parse();
		if (this.ok) {
		  return this.execute(argArr)
		  .then(()=>{
			if (this.level.isSolved()) return this.level.win();
			else return this.level.lose();
		  });
		}
	}

	//grab items in spell box
	//make (if nec) objects with action prop, and poss others
	// make array of component objs
	parse(argArr){

		//todo - how are spells being stored/passed in???
		//do we need to translate them?

		//hard coded for testing

		// return argArr.filter((command)=>command.type==='tool');
		return [{
		// 	action: 'move',
		// 	direction: 'right',
		// 	distance: 2
		// }, {
			action: 'move',
			direction: 'down',
			distance: 1,
			current: false
		}, {
			action: 'move',
			direction: 'right',
			distance: 2,
			current: false
		}, {
			action: 'move',
			direction: 'down',
			distance: 2,
			current: 2
		// }, {
		// 	action: 'ifStatement',
		// 	condition: true,
		// 	expressions: [{
		// 		action: 'ifStatement',
		// 		condition: true,
		// 		expressions: [{
		// 				action: 'forLoop',
		// 				number: 2,
		// 				expressions: [{
		// 						action: 'move',
		// 						direction: 'right',
		// 						distance: 1
		// 					}, {
		// 						action: 'move',
		// 						direction: 'down',
		// 						distance: 1
		// 					}]
		// 		}]
		// 	}, {
		// 	action: 'pickUp',
		// 	variable: 'GreenPotion',
		// 	}]
		// 	},{
		// 	action: 'move',
		// 	direction: 'left',
		// 	distance: 1}]
			},{
			action: 'pickUp',
			variable: 'GreenPotion',
			},{
			action: 'move',
			direction: 'up',
			distance: 2

		}];
	}



  	//steps through program one command at a time
  	// spell box can be changed betwee steps (other than current command)
  	// resets board if first step
  	// sets current command to null if last step (will prompt reset on next stepthrough)
  	// stepThrough(argArr){
  	// 	var spellArr = this.parse(argArr);
  	// 	if(!this.currentCommand) {
  	// 		console.log('starting new round')
  	// 		this.reset();
  	// 		this.currentCommand = spellArr[0];
  	// 		this.currentCommand.current = 3;

  	// 	} else {
  	// 		console.log(this.currentCommand)
  	// 		var prevIndex = _.findIndex(spellArr, {'current': 2});
  	// 		console.log(spellArr)
  	// 		this.currentCommand.current = false;
  	// 		this.currentCommand = prevIndex < spellArr.length-1 ? spellArr[prevIndex+1] : null;
  	// 		if(this.currentCommand) this.currentCommand.current = true;
  	// 		console.log(prevIndex, this.currentCommand);
  	// 	}
  	// 	if (this.currentCommand){
  	// 		// this.running = true;
  	// 		return this.executeCommand(this.currentCommand);
  	// 		// this.running = false;
  	// 	}
  	// }

  	//this stepThough function runs through spell components by index, 
  	//which solves the problem of repeated commands
  	// spell arr can't be changed during function (the stuff already stepped through can't change)
	stepThrough(argArr){
  		var spellArr = this.parse(argArr);
  		if(this.currentCommand === null) {
  			this.reset();
  			this.currentCommand = 0;

  		} else {
  			console.log(this.currentCommand)
  			this.currentCommand < spellArr.length-1 ? this.currentCommand ++ : this.currentCommand = null;
  		}
  		if (this.currentCommand){
  			return this.executeCommand(spellArr[this.currentCommand]);
  		}
  	}


  	//executes the spell
  	execute(argArr){
	    // this.running = true;
	    this.cycle(this.avatar.position);
	    var spellArr = this.parse(argArr);
	    // var spellArr = Promise.map(noPromSpellArr, (spell)=>{
	    	// return spell})
	    // run async execute command fn on each of the commands in the spell, serially
	    return Promise.reduce(spellArr, (nothing, component) => {
	    	console.log('component', component)
	     return this.executeCommand(component);

		});
	    // return spellArr.each((component) => this.executeCommand(component));
	    // this.running = false;
	    // return Promise.resolve(spellArr)
	}

	//cycles all events on a particular position
	cycle(position) {
	    // if (!this.running) return;
	    this.map.mapArray[position.x][position.y].forEach(obj=>obj.onCycle());

	}

	executeCommand (component) {
	    //component is an obj that was part of the array of components dragged to the spell
	    //has props for action, and any other additional props
	    var spell = this;
	    var avatar = this.avatar;
	    var map = this.map;

	    // Lock for initial command, more locks may be applied by animations, etc.
	    this.lock();

	    switch(component.action){

	    	case 'move':
	    		var distArr = [];
	    		for(var i = 0; i<component.distance; i++){
	    			distArr.push(i);
	    		}
	    		// var promArr = Promise.map(distArr, (num)=>num)
	    		return Promise.reduce(distArr, (nothing, num)=>moveOne(component.direction))
	    		.then(()=>spell.cycle(avatar.position));
	    	case 'give':
            	// collectable obj (ref) has to be passed into the function as .variable
            	//search map pos for person to give to
            	var toGive = spell.map.checkPos(this.avatar.position, component.person); 
	    		if (toGive) {
    				if(component.variable.holding){
    					component.variable.holding = !component.variable.holding;	    			
	    				this.level.updateReq(toGive, 'give', component.variable);
    				} 
    			}
    			break;
	    	case 'pickUp':
	    		console.log('picking up', component.variable, component.variable.holding)
	    		//search the map objects on that position for the one that matches component.variable,
	    		var toPick = spell.map.checkPos(this.avatar.position, component.variable); 
	    		if (toPick) {
	    			spell.map.removeObj(toPick);
                	// collectable obj (ref) has to be passed into the function as .variable
	    			component.variable.holding = !component.variable.holding;
	    			this.level.updateReq(toPick, 'pickUp', 'true')
                }
	    		break;
	    	case 'ifStatement':
	    		if (component.condition){
	    			// var expressions = Promise.map(component.expressions, (command)=>command);
	    			return Promise.reduce(component.expressions,(nothing, command)=> spell.executeCommand(command));
	    		}
	    		else if (component.elseExpr) {
	    			// var expressions = Promise.map(component.elseExpr, (command)=>command);
	    			return Promise.reduce(component.expressions, (nothing, command)=> spell.executeCommand(command));
	    		}
	    		break;
	    	case 'whileLoop':
	    		return promiseWhile(component.condition, executeExpressions)
	    		break;
	    	case 'forLoop':
	    		console.log('for loop')
	    		var numArr = [];
	    		for(var i = 0; i<component.number; i++){
	    			numArr.push(i);
	    		}
	    		// promArr = Promise.map(numArr, (num)=>num)
	    		// var expressions = Promise.map(component.expressions, (command)=>command);
	    		return Promise.reduce(numArr, (nothing)=>expressions.each((command)=> spell.executeCommand(command)));
	    		break;
	    	case 'ask':
	    	//not sure what these do
	    		console.log('asking')
	    		break;
	    	case 'tell':
	    		console.log('telling')
	    		break;
	    }

	    // ??component is inside the scope of the function that executeExpression is called in???
	    // used as action for promiseWhile()
	    function executeExpressions(){
	    	var expressions = Promise.map(component.expressions, (command)=>command);
	    	return expressions.each((command)=>spell.executeCommand(command))
	    }

	    // action is a function
	    function promiseWhile (condition, action){
		    if (!condition) return;
		    return action().then(promiseWhile.bind(null, condition, action));
		}

	    function moveOne(direction){
	    	var newPos = avatar.move(direction, 1);
	        if (newPos) {
	          // Do the move!
	          console.log(newPos)
	          return avatar.promTweenQueen({x: newPos.x*TilesizeFactory.TILESIZE, y: newPos.y*TilesizeFactory.TILESIZE}, 200)
	          .then(()=>{
	          		console.log('set avatar to ', newPos)
		          avatar.setMapPos(newPos);
	            // spell.unlock();
	          });

	        } else {
	          // Bump!
	          console.log('bump', curPos)
	          var curPos = avatar.entity;
	          // var newPos = curPos.dup().addDir(direction, 8);
	          var heightBump = 0;
	          var latBump = 0;
	          switch (direction){
	          	case 'down':
	          		heightBump = TilesizeFactory.TILESIZE/4;
	          		break;
	          	case 'up':
	          		heightBump = 0 - TilesizeFactory.TILESIZE/4;
	          		break;
	          	case 'left':
	          		latBump = 0 - TilesizeFactory.TILESIZE/4;
	          		break;
	          	case 'right':
	          		latBump = TilesizeFactory.TILESIZE/4;
	          		break;

	          }
	          return avatar.promTweenQueen({x: curPos.x + latBump, y: curPos.y + heightBump}, 100)
	          .then(()=>{
	            return avatar.promTweenQueen({x: curPos.x - latBump, y: curPos.y - heightBump}, 100)
	          }).then(()=>{
	            return Promise.delay(400);
	          });
	      	}

	    }


	}



  }
  return Spell;
  });
