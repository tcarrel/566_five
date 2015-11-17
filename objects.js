


function get_scene(shape)
{
    var objects = world_obj(
            1, 1, 1,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            null,
            "root" );
//    var objects = []; 

    ///////////////////
    //  Make the cube.
    //  -- Note that the base cube is 1x1x1 with its origin centered.
    var cube = world_obj( 
                2,  2,  2,     //Scale.
                0,1/2, 10,   //Origin.
                10,  0,  10,     //Initial translation.
                0,  0,   0,   //Initial rotation about the local origin.
                shape,          //The actual shape data.
                "cube" );     //A unique id or name for this piece of this shape.
    

    ///////////////////
    // Make the table.
    var table = world_obj(
            1,   1, 1,
            0,   1/2, 0, //Set origin to bottom of the feet of table.
            30.3,   0, 15,
            0,   12.25, 0,
            null,
            "table" );

    var leg1 = world_obj(
            1/8, 1,  1/8,
            0,   0,  0,
            31/64, 0,  31/64,
            0,   270,  0,
            shape,
            "leg_1"
            );
    var leg2 = world_obj(
            1/8, 1,  1/8,
            0, 0,  0,
            -31/64,  0,  31/64,
            0,     180,  0,
            shape,
            "leg_2"
            );
    var leg3 = world_obj(
            1/8, 1,  1/8,
            0, 0,  0,
            -31/64,  0, -31/64,
            0,     90,  0,
            shape,
            "leg_3"
            );
    var leg4 = world_obj(
            1/8, 1,  1/8,
            0, 0,  0,
            31/64, 0, -31/64,
            0,     0,  0,
            shape,
            "leg_4"
            );
    var top_ = world_obj(
            9/8, 1/32, 9/8,
            0, -1/2,   0,
            0, 1/2,   0,
            180,      0,   0,
            shape,
            "top"
            );
    leg1.set_parent( table );
    leg2.set_parent( table );
    leg3.set_parent( table );
    leg4.set_parent( table );
    top_.set_parent( table );

    ///////////////////
    // Make the windmill.
    var windmill = world_obj(
            1/32, 1/2, 1/32,
            0,    25/16,    0,
            0,     0,    0,
            0,        0,    0,
            shape,
            "windmill"
            );

    var blades = world_obj(
            32, 2, 32, //Compensate for the base's scaling.
            0, 0, 3/64,
            0, 1/2, 0,
            0, 0, 0,
            null,
            "blades"
            );

    var blades_ = [];
    var b_qty = Number(window.prompt("Number of blades?\n  Less than 30.", "5"));
    for( var ii = 0; ii < 360; ii += (360 / b_qty) )
        blades_.push( world_obj(
                    1/16, 5/16, 1/64,
                    0,   5/8,  0,
                    0,   0,  0,
                    7.5,   210,  ii,
                    shape,
                    "blade_" + ii
                    ));    
    for( var i = 0; i < blades_.length; i++ ) 
        blades_[i].set_parent(blades);

    blades.set_parent(windmill);
    windmill.set_parent( table );
    table.set_parent( objects );
    cube.set_parent( objects );

    return objects;
}


function world_obj( 
        xs, ys, zs, //Scale.
        xo, yo, zo, //Origin.
        xp, yp, zp, //Initial translation.
        xr, yr, zr, //Initial rotation about the local origin.
        verts,      //The actual shape data.
        id )        //A unique id or name for this piece of this shape.
{
    var obj = 
    {
        name:           id,
        pos:            new Matrix4,
        scl:            new Matrix4,
        rot:            new Matrix4,        
        local_rot:      new Matrix4,
        origin:         new Matrix4,
        world_matrix:   new Matrix4,
        local_matrix:   new Matrix4,
        shape:          verts,
        parent_:        null,
        dirty:          true, // dirty "bit"
        children:       [],
        rotate:         function(x, y, z) {
            var pitch = new Matrix4;
            var roll  = new Matrix4;
            var yaw   = new Matrix4;

            if( z != 0 )
            {
                //this.local_matrix.rotate( z % 360, 0, 0, 1 );
                roll.setRotate( z % 360, 0, 0, 1 );
                this.rot.concat( roll );
            }
            if( x != 0 )
            {
                pitch.setRotate( x % 360, 1, 0, 0 );
                this.rot.concat( pitch );
            }
            if( y != 0 )
            {
                //this.local_matrix.rotate( y % 360, 0, 1, 0 );
                yaw.setRotate( y % 360, 0, 1, 0 );
                this.rot.concat( yaw );
            }
            this.set_dirty();
        },
        translate:      function( x, y, z )
        {
            this.pos.translate( x, y, z );
            this.set_dirty();
        },
        scale:          function( x, y, z )
        {
            this.scl.scale( x, y, z );
            this.set_dirty();
        },
        update_world:   function(p_world)
        {
            if( this.dirty ) // Only update if something has changed.
            { 
                this.local_matrix.concat( this.pos );
                this.local_matrix.concat( this.local_rot );
                this.local_matrix.concat( this.scl );
                this.local_matrix.concat( this.rot );
                this.local_matrix.concat( this.origin );
                if(p_world)
                {
                    this.local_matrix.set( this.pos );
                    this.local_matrix.concat( this.local_rot );
                    this.local_matrix.concat( this.scl );
                    this.local_matrix.concat( this.rot );
                    this.local_matrix.concat( this.origin );


                    this.world_matrix.set( p_world );
                    this.world_matrix.concat( this.local_matrix );
                }
                else
                    this.world_matrix.set( this.local_matrix );
            }

            // Recursively update all children in graph.
            for( var ii = 0; ii < this.children.length; ii++ )
                this.children[ii].update_world( this.world_matrix );

            this.dirty = false;
        },
        set_parent:     function(par)
        {
            par.children.push(this);
            this.parent_ = par;
            this.set_dirty();

            return true;
        },
        render:         function( gl, view, proj, wf )
        {
            for( var ii = 0; ii < this.children.length; ii++ )
                this.children[ii].render(gl, view, proj, wf );

            if( this.shape )
            {
                this.shape.render( gl, this.world_matrix, view, proj, wf );
            }
        },
        get_object:     function( id )
        {
            if( this.name == id )
                return this;

            var obj;
            var found = false;
            for( var ii = 0; !found && (ii < this.children.length); ii++ )
            {
                obj = this.children[ii].get_object( id );
                if( obj )
                    found = true;
            }
            return obj;
        },
        set_dirty: function()
        {
            this.dirty = true;

            for( var ii = 0; ii < this.children.length; ii++ )
                this.children[ii].set_dirty();
        }
    };

    obj.translate( xp, yp, zp );
    obj.scale(     xs, ys, zs );
    obj.rotate(    xr, yr, zr );
    obj.local_rot.set( obj.rot );
    obj.rot.setIdentity();
    obj.origin.setTranslate( xo, yo, zo );

    return obj;
}


function search_graph( id, graph )
{
    /*
       var obj;
       var found = false;

       for( var ii = 0; !found && ii < graph.length; ii++ )
       {
       obj = graph[ii].get_object(id);
       if( obj )
       found = true;
       }

       return obj;
       */
    return graph.get_object(id);
}
