app.factory('SpellFactory', function(TilesizeFactory){
	// List of valid commands
  //var CODES = ['move', 'if', 'loop', 'pickUp', 'putDown', 'ask', 'tell'];

  class Spell {
  	constructor(level){
  		this.level = level;
	    this.map = level.map;
	    this.key = level.key;
	    this.avatar = this.map.getAvatar();
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
			if (this.isSolved()) return this.level.win();
			else return this.level.lose();
		  });
		}
	}
	

	//TODO: actually check if the puzzle has been solved
	isSolved(){
		//need to compare spellVars to the requirements
		return false;
	}

	//grab items in spell box
	//make (if nec) objects with action prop, and poss others
	// make array of component objs
	parse(argArr){

		//todo - how are spells being stored/passed in???
		//do we need to translate them?

		//hard coded for testing
		console.log('parsing')
		console.log(argArr)
		// return argArr.filter((command)=>command.type==='tool');
		return [{
		// 	action: 'move',
		// 	direction: 'right',
		// 	distance: 2
		// }, {
			action: 'move',
			direction: 'down',
			distance: 1
		}, {
			action: 'forLoop',
			number: 3,
			expressions: [{
				action: 'move',
				direction: 'right',
				distance: 1
			}, {action: 'move',
				direction: 'down',
				distance: 1}]
			},{action: 'move',
			direction: 'up',
			distance: 2
		
		}];
	}

  	//steps through program one command at a time
  	// spell box can be changed betwee steps (other than current command)
  	// resets board if first step
  	// sets current command to null if last step (will prompt reset on next stepthrough)
  	stepThrough(argArr){
  		var spellArr = this.parse(argArr);
  		if(!this.currentCommand) {
  			this.reset();
  			this.currentCommand = spellArr[0];
  		} else {
  			var prevIndex = _.findIndex(spellArr, this.currentCommand);
  			this.currentCommand = prevIndex < spellArr.length-1 ? spellArr[prevIndex+1] : null;
  		}
  		if (this.currentCommand){
  			// this.running = true;
  			return this.executeCommand(this.currentCommand);
  			// this.running = false;
  		} 
  	}

  	//executes the spell
  	execute(argArr){
	    // this.running = true;
	    this.cycle(this.avatar.position);
	    var noPromSpellArr = this.parse(argArr)
	    var spellArr = Promise.map(noPromSpellArr, (spell)=>{
	    	return spell}) 
	    // run async execute command fn on each of the commands in the spell, serially
	    return spellArr.each((component) => this.executeCommand(component));
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
	    		var promArr = Promise.map(distArr, (num)=>num)
	    		return promArr.each(()=>moveOne(component.direction))
	    		.then(()=>this.cycle(avatar.position));
	    	case 'pickUp':
	    	case 'putDown':
	    		// collectable obj (ref) has to be passed into the function as .variable
	    		component.variable.holding = !component.variable.holding;
	    		break; 
	    	case 'ifStatement':
	    		if (component.condition){
	    			var expressions = Promise.map(component.expressions, (command)=>command);
	    			return expressions.each(command=> this.executeCommand(command));
	    		}  
	    		else if (component.elseExpr) {
	    			var expressions = Promise.map(component.elseExpr, (command)=>command);
	    			return expressions.each(command=> this.executeCommand(command));
	    		}
	    		break;
	    	case 'whileLoop':
	    		return promiseWhile(component.condition, executeExpression)
	    		break;
	    	case 'forLoop':
	    		console.log('for loop')
	    		var numArr = [];
	    		for(var i = 0; i<component.number; i++){
	    			numArr.push(i);
	    		}
	    		promArr = Promise.map(numArr, (num)=>num)
	    		var expressions = Promise.map(component.expressions, (command)=>command);
	    		return promArr.each(()=>expressions.each((command)=> this.executeCommand(command)))
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
	    // function executeExpressions(){
	    // 	return component.expression.each((command)=>this.executeCommand(command))
	    // }

	    //action is a function
	 //    var promiseWhile = Promise.method((condition, action)=>{
		//     if (!condition()) return;
		//     return action().then(promiseWhile.bind(null, condition, action));
		// });

	    function moveOne(direction){
	    	var newPos = avatar.move(direction, 1);
	        if (newPos) {
	          // Do the move!
	          return avatar.promTweenQueen({x: newPos.x*TilesizeFactory.TILESIZE, y: newPos.y*TilesizeFactory.TILESIZE}, 200)
	          .then(()=>{
		          avatar.setMapPos(newPos);
	            // spell.unlock();
	          });

	        } else {
	          // Bump!
	          var curPos = avatar.entity;
	          // var newPos = curPos.dup().addDir(direction, 8);
	          return avatar.entity.promTweenQueen({x: curPos.x + TilesizeFactory.TILESIZE, y: curPos.y + TilesizeFactory.TILESIZE}, 100)
	          .then(()=>{
	            return avatar.entity.promTweenQueen({x: curPos.x, y: curPos.y}, 100)
	          }).then(()=>{
	            return Promise.delay(400);
	          });
	      	}

	    }
	    
	    
	}



  }
  return Spell;
  });