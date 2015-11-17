


function get_scene(shape)
{
    var objects = []; 

    ///////////////////
    //  Make the cube.
    //  -- Note that the base cube is 1x1x1 with its origin centered.
    objects.push(world_obj( 
                 2,  2,  2,     //Scale.
                 0,1/2, 10,   //Origin.
                10,  0,  10,     //Initial translation.
                 0,  0,   0,   //Initial rotation about the local origin.
                shape,          //The actual shape data.
                "cube" ) );     //A unique id or name for this piece of this shape.

    ///////////////////
    // Make the table.
    var table = world_obj(
            1,   1, 1,
            0,   0, 0, //Set origin to bottom of the feet of table.
            0,   1/2, 0,
            0,   0, 0,
            null,
            "table" );

    var leg1 = world_obj(
            1/8, 15/16,  1/8,
            0,   -1/32,  0,
            1/2, 0,  1/2,
            0,   0,  0,
            shape,
            "leg_1"
            );
    var leg2 = world_obj(
            1/8, 15/16,  1/8,
            0,     -1/32,  0,
            -1/2,  0,  1/2,
            0,     0,  0,
            shape,
            "leg_2"
            );
    var leg3 = world_obj(
            1/8, 15/16,  1/8,
            0,     -1/32,  0,
            -1/2,  0, -1/2,
            0,     90,  0,
            shape,
            "leg_3"
            );
    var leg4 = world_obj(
            1/8, 15/16,  1/8,
            0,     1/2,  0,
            1/2,   -15/32, -1/2,
            0,     0,  0,
            shape,
            "leg_4"
            );
    var top_ = world_obj(
            9/8, 1/16, 9/8,
            0,  1/2,   0,
            0,  1/2 - 1/16,   0,
            0,      0,   0,
            shape,
            "top"
            );
    leg1.set_parent( table );
    leg2.set_parent( table );
    leg3.set_parent( table );
    leg4.set_parent( table );
    top_.set_parent( table );
    objects.push( table );

    ///////////////////
    // Make the windmill.
    var windmill = world_obj(
            1/32, 1/2, 1/32,
            0,     1/2,    0,
            0,    1/2,    0,
            0,        0,    0,
            shape,
            "windmill"
            );
    var blades  = world_obj(
            1, 1, 1,
            0, 0, 1/16,
            0, 0, -1/16,
            0, 0, 0,
            null,
            "blades"
            );
    blades.set_parent(windmill);
    var blade_u = world_obj(
            1/16, 1/4, 1/64,
            0,    1/2, 0,
            0, 0, 0,
            0, 0, 0,
            shape,
            "blade_up"
            );
    blade_u.set_parent( blades );

    windmill.set_parent( table );
    //    var
    objects.push(windmill);

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
        name: id,
        //       pos:            new Matrix4,
        rot:            new Matrix4,        
        world_matrix:   new Matrix4,
        local_matrix:   new Matrix4,
        shape:          verts,
        parent_:        null,
        dirty:          true, // dirty "bit"
        children:       [],
        rotate:         function(x, y, z) {
            if( x != 0 )
            {
                this.local_matrix.rotate( x % 360, 1, 0, 0 );
                this.dirty = true;
            }
            if( z != 0 )
            {
                this.local_matrix.rotate( z % 360, 0, 0, 1 );
                this.dirty = true;
            }
            if( y != 0 )
            {
                this.local_matrix.rotate( y % 360, 0, 1, 0 );
                this.dirty = true;
            }
        },
        translate:      function( x, y, z )
        {
            this.local_matrix.translate( x, y, z );
            this.dirty = true;
        },
        scale:          function( x, y, z )
        {
            this.local_matrix.scale( x, y, z );
            this.dirty = true;
        },
        update_world:   function(p_world)
        {
            if( this.dirty ) // Only update if something has changed.
            {
                if(p_world)
                {
                    var temp = new Matrix4;
                    temp.set( p_world );
                    temp.concat( this.local_matrix );
                    this.world_matrix.set(temp);
                }
                else
                    this.world_matrix.set( this.local_matrix );

                this.dirty = false;
            }

            // Recursively update all children in graph.
            for( var ii = 0; ii < this.children.length; ii++ )
                this.children[ii].update_world( this.world_matrix );
        },
        set_parent:     function(par)
        {
            par.children.push(this);
            this.parent_ = par;
            this.dirty = true;

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

            var found = null;
            for( var ii = 0; (found === null) && (ii < this.children[ii]); ii++ )
            {
                found = this.children[ii].get_object( id );
            }
            return found;
        }
    };

    /*
       obj.set_origin( xo, yo, zo );
       obj.translate( xp, yp, zp );
       obj.set_rotate( xr, yr, zr );

       obj.scale.setScale( xs, ys, zs );
       */

    //  /*

    obj.translate( xp, yp, zp );
    obj.rotate(    xr, yr, zr );
    obj.scale(     xs, ys, zs );
    obj.translate( xo, yo, zo );
    //   */
    /*
       obj.local_matrix.translate( xo, yo, zo );
       obj.local_matrix.scale( xs, ys, zs );
       */

    //obj.set_rotate( xr, yr, zr );
    obj.update_world();

    return obj;
}


function search_graph( id, graph )
{
    var found;

    for( var ii = 0; (found === null ) && ii < graph.length; ii++ )
        found = graph[ii].get_object(id);
}
