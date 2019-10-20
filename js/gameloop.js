        /*-----------------------------------------------------------------------------------*\
		|*                            EVENT LISTENERS & HANDLERS                              |
		\*-----------------------------------------------------------------------------------*/
		g_myCanvas.addEventListener('click', (l_event) => {
			// handle clicks
			g_mouseX    = l_event.clientX - g_myCanvas.getBoundingClientRect().x
			g_mouseY    = l_event.clientY - g_myCanvas.getBoundingClientRect().y
			g_clickType = "left";
		})
		
		g_myCanvas.addEventListener('contextmenu', (l_event) => {
			// handle clicks
			g_mouseX    = l_event.clientX - g_myCanvas.getBoundingClientRect().x
			g_mouseY    = l_event.clientY - g_myCanvas.getBoundingClientRect().y
			g_clickType = "right";
			l_event.preventDefault();
		})
		
		document.addEventListener('keydown', (l_event) => {
			if (l_event.key.toLowerCase() == 's'){
				g_currentKey = 's'; // start node
			} else if (l_event.key.toLowerCase() == 'e'){
				g_currentKey = 'e'; // end node
			} else if (l_event.key.toLowerCase() == 'd'){
				g_currentKey = 'o'; // obstacle
			} else if (l_event.keyCode == '37'){
				// left key... select previous
				g_currentKey = 'left';
			} else if (l_event.keyCode == '39'){
				// right key.. select next
				g_currentKey = 'right';
			} else if (l_event.keyCode == 38){
				g_currentKey = 'up';
			} else if (l_event.keyCode == 40){
				g_currentKey = 'down';
			} else if (l_event.key == ' '){
				g_startSorting = true;
			}
		})
		
		/*-----------------------------------------------------------------------------------*\
		|*                           GAME LOOP & Other init functions                         |
		\*-----------------------------------------------------------------------------------*/
		
		function f_gameLoop(){
			f_manageInputs();
			f_frameCounter();
			f_checkClick();
			f_checkKeys();
			f_findPath();
			f_TracePath();
			f_clearCanvas();
			f_drawObjects();
			f_drawSelector();
			f_endDrawings();
		}
		
		function f_resetSearch(){
			// reset flags
			g_mainChild = g_selectedNode = g_currentNode = undefined;
			g_pathNodes = [];
			g_openList = [];
			g_closedList = [];
			g_neighbours = [];
			g_isDone = g_pathFound = g_reachedHome = g_startSorting = false;
			
			// reset some properties of nodes
			for (var i=0; i<g_numNodes; i++){
				g_nodes[i].isNeighbour = g_nodes[i].isClosed = g_nodes[i].isScanned = g_nodes[i].isPath = g_nodes[i].isCurrent = false;
				g_nodes[i].parent = g_nodes[i].h = g_nodes[i].g = g_nodes[i].f = undefined;
			}
			
			// reset the object's x/y co-ordinates and some flag
			g_object.isMoving = g_object.isDone = false;
			g_object.x = g_object.targetX = g_nodes[g_startingNode].x + g_nodeWidth/2;
			g_object.y = g_object.targetY = g_nodes[g_startingNode].y + g_nodeWidth/2;
		}
			
		function f_init(l_nodew){
			g_nodeWidth     = l_nodew || 40;                                         
			g_numRows       = parseInt(g_myCanvas.height/g_nodeWidth -1); 
			g_numColumns    = parseInt(g_myCanvas.width/g_nodeWidth -1);  
			g_numNodes      = g_numRows * g_numColumns;                   
			g_FPS           = 30;                                         
			g_timeInterval  = 1000/g_FPS;                                 
			g_nodes         = new Array(g_numNodes);                      
			g_mouseX        = undefined;                                  
			g_mouseY        = undefined;                                  
			g_clickType     = undefined;                                  
			g_currentKey    = undefined;                                  
			g_selectedNode  = undefined;                                  
			g_selectorWidth = 5;                                          
			g_startingNode  = undefined;                                  
			g_endingNode    = undefined;                                  
			g_openList      = [];                                         
			g_closedList    = [];                                         
			g_pathFound     = false;                                      
			g_startSorting  = false;                                      
			g_mainChild     = undefined;                                  
			g_isDone        = false;                                      
			g_frameCount    = 0;                                          
			g_timePassed    = 0;                                          
			g_pathNodes     = [];                                         
			g_currentNode   = undefined;                                  
			g_neighbours    = []; 
			g_animSpeed     = 4                                           
			g_showdbginfo   = true                                        
			g_heuristic     = 'm'                                         
			g_allowDiagonal = false                                       
			g_reachedHome   = false 
			f_generateNodes();
		}
		
		f_init()
		var g_gameLoop = setInterval(f_gameLoop, g_timeInterval)