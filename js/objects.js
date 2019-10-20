	
function c_node(l_x, l_y, l_width, l_id, l_row, l_column){

	// Node Properties
	this.x           = l_x;         // X Co-ordinate
	this.y           = l_y;         // Y Co-ordinate
	this.width       = l_width;     // width of rect
	this.fontSize    = l_width/4;   // font size
	this.h           = undefined;   // h = dist from ending node
	this.g           = undefined;   // g = dist from starting node
	this.f           = undefined;   // f = g+h
	this.row         = l_row;       // Row number of the node
	this.column      = l_column;    // Column number of the node
	this.id          = l_id;        // Index of the node
	this.type        = "empty";     // empty, s, e, o or [start/end/obstacle]
	this.isClosed    = false;       // set to true when this object is sent to closed list
	this.parent      = undefined;   // Parent node ID/index
	this.isSelected  = false;       // is it currently clicked
	this.isPath      = false;       // is it a path node
	this.isCurrent   = false;       // is this node currently being scanned
	this.isNeighbour = false;       // is this node a neighbour of the currently scanned node
	this.isScanned   = false;       // is this node scanned
	this.rippleRad   = 0;           // ripple radius
			
	// Node Methods
	this.m_draw = (l_context, l_showDBG, l_reachedhome) => {
		l_context.strokeStyle = (this.type == 's') ? "greenyellow" : 
		(this.type == 'e') ? 'orange' : 
		(this.type == 'o') ? 'red' :
		(this.isCurrent) ? 'white' :
		(this.isScanned) ? 'aqua' :
		(this.isNeighbour) ? 'blue' :
		"gray";
		
		l_context.fillStyle   = (this.type == 's') ? "greenyellow" : 
		(this.type == 'o') ? 'red' : 
		(this.type == 'e') ? 'orange' : 
		(this.isCurrent) ? 'white' :
		(this.isScanned) ? 'aqua' :
		(this.isNeighbour) ? 'blue' :
		"black";
		
		if (this.isPath){
			// fill style is lime if the node is a path
			l_context.fillStyle = "lime";
		}
		//l_context.fillRect(this.x+5, this.y+5, this.width-10, this.width-10)
		l_context.fillRect(this.x, this.y, this.width, this.width)
		l_context.strokeRect(this.x, this.y, this.width, this.width)
		
		// write the node ID in the center of the node
		if (l_showDBG){
			l_context.fillStyle = (this.type == 'empty' && !this.isPath && !this.isScanned) ? "white" : "black";
			l_context.font = this.fontSize + 'px monospace';
			l_context.textAlign = 'center'
			l_context.fillText(this.id, this.x+this.width/2, this.y+this.width/2)
		}
			
				
		if (this.type == 'o'){
			// node type = obstacle
			// draw the circle
			l_context.fillStyle = "red"
			l_context.beginPath();
			l_context.arc(
				this.x + this.width/2, this.y + this.width/2, this.width/2-3, 0, Math.PI * 2
			);
			l_context.fill();
			l_context.closePath();
			
			// draw the X
			l_context.strokeStyle = 'black';
			l_context.moveTo(this.x + this.width/4, this.y + this.width/4);
			l_context.lineTo(this.x+this.width-this.width/4, this.y+this.width-this.width/4)
			l_context.moveTo(this.x+this.width-this.width/4, this.y+this.width/4)
			l_context.lineTo(this.x+this.width/4, this.y+this.width-this.width/4)
			l_context.stroke();	
		} else if (this.type == 'e' && l_reachedhome){
			// the ripple effect
			(this.rippleRad < this.width/2) ? this.rippleRad++ : this.rippleRad = 0;
			l_context.lineWidth = 3;
			l_context.strokeStyle = "black"
			l_context.beginPath();
			l_context.arc(
				this.x + this.width/2, this.y + this.width/2, this.rippleRad, 0, Math.PI * 2
			);
			l_context.stroke();
			l_context.closePath();
			l_context.lineWidth = 1;
		}
			
		/** // show g and h
		if (this.width > 70 && l_showDBG){
			if (this.h != undefined && this.g != undefined){
				l_context.font = '20px monospace';
				l_context.textAlign = 'left'
				l_context.fillText(this.h, this.x+5, this.y+30)
			}
		}
		**/
	}		
}
		
		
function c_object(l_x, l_y, l_radius, l_color, l_speed){
	this.x        = l_x;
	this.y        = l_y;
	this.radius   = l_radius;
	this.color    = l_color;
	this.targetX  = l_x;
	this.targetY  = l_y;
	this.speed    = l_speed;
	this.isDone   = false;
	this.isMoving = false;
	
	this.m_draw = (l_context) => {
		if (!this.isDone){
		l_context.fillStyle = "black"
		l_context.beginPath();
		l_context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		l_context.fill();
		l_context.closePath();}
	}
	
	this.m_move = () => {
		if (this.targetX > this.x){
			this.x += this.speed;
			this.isMoving = true;
		} else if (this.targetX < this.x){
			this.x -= this.speed;
			this.isMoving = true;
		} 
		
		if (this.targetY > this.y){
			this.y += this.speed;
			this.isMoving = true;
		} else if (this.targetY < this.y){
			this.y -= this.speed;
			this.isMoving = true
		} 
				
		if (this.x == this.targetX && this.y == this.targetY) {
			this.isMoving = false;
		}
	}
	
}