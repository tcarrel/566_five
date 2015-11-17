


function get_scene(shape)
{
    var objects = []; 

    ///////////////////
    // Make the cube.
    objects.push(world_obj( 
                 1,  1,  1,     //Scale.
                 0,  0.5,  0,     //Origin.
                10,  0, 10,     //Initial translation.
                12,  15,  0,   //Initial rotation about the local origin.
                true,           //Bool, some nodes may not need to be drawn.
                shape,          //The actual shape data.
                "cube" ) );     //A unique id or name for this piece of this shape.

    /*
    ///////////////////
    // Make the table.
    var table = world_obj(
            1,   1, 1,
            0, 1/2, 0, //Set origin to bottom of the feet of table.
            12,   0, 12,
            0,   90, 0,
            false,
            shape,
            "table" );
    table.scale_group.set( table.scale );
    var leg1 = world_obj(
            1/8,   1,  1/8,
            0,     0,  0,
            1/2,   1/2,  1/2,
            0,     0,  0,
            true,
            shape,
            "leg_1"
            );
    var leg2 = world_obj(
            1/8,   1,  1/8,
            0,     0,  0,
            -1/2,  1/2,  1/2,
            0,     0,  0,
            true,
            shape,
            "leg_2"
            );
    var leg3 = world_obj(
            1/8,   1,  1/8,
            0,     0,  0,
            -1/2,  1/2, -1/2,
            0,     0,  0,
            true,
            shape,
            "leg_3"
            );
    var leg4 = world_obj(
            1/8,   1,  1/8,
            0,     0,  0,
            1/2,   1/2, -1/2,
            0,     0,  0,
            true,
            shape,
            "leg_4"
            );
    var top_ = world_obj(
            9/8, 1/16, 9/8,
            0,      0,   0,
            0,  33/32,   0,
            0,      0,   0,
            true,
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
            1/32,  1/2, 1/32,
            0,     1/16,    0,
            0,    19/16,    0,
            0,        0,    0,
            true,
            shape,
            "base"
            );
    objects.push(windmill);

    */
    return objects;
}


function world_obj( 
        xs, ys, zs, //Scale.
        xo, yo, zo, //Origin.
        xp, yp, zp, //Initial translation.
        xr, yr, zr, //Initial rotation about the local origin.
        to_draw,    //Bool, some nodes may not need to be drawn.
        verts,      //The actual shape data.
        id )        //A unique id or name for this piece of this shape.
{
    var obj = 
    {
        name: id,
        scale:          new Matrix4,
        pos:            new Matrix4,
        local_origin:   new Matrix4,
        rot:            new Matrix4,        
        world_matrix:   new Matrix4,
        local_matrix:   new Matrix4,
        shape:          verts,
        draw:           to_draw,
        parent_:        null,
        dirty:          true, // dirty "bit"
        children:       [],
        set_rotate:         function(x, y, z) {
            var tempx = new Matrix4;
            var tempy = new Matrix4;
            var tempz = new Matrix4;
            
            if( x != 0 )
            {
                tempx.setRotate( x % 360, 1, 0, 0 );
                this.dirty = true;
            }
            if( z != 0 )
            {
                tempz.setRotate( z % 360, 0, 0, 1 );
                this.dirty = true;
            }
            if( y != 0 )
            {
                tempy.setRotate( y % 360, 0, 1, 0 );
                this.dirty = true;
            }
            this.rot.concat( tempz );
            this.rot.concat( tempx );
            this.rot.concat( tempy );
            this.local_matrix.concat( this.rot );
        },
        translate:      function( x, y, z )
        {
            //this.pos.set( this.local_origin );
            this.pos.translate( x, y, z);
            this.local_matrix.concat( this.pos );

            this.dirty = true;
        },
        update_world:   function(p_world)
        {
            if( this.dirty ) // Only update if something has changed.
            {                //this.
                if(p_world)
                {
                    var temp = new Matrix4;
                    temp.set( this.local_matrix );
                    temp.concat( p_world );
                    this.world_matrix.set(temp);
                }
                else
                    this.world_matrix.set( this.local_matrix );
            }

            // Recursively update all children in graph.
            for( var ii = 0; ii < this.children.length; ii++ )
                this.children[ii].update_world( this.world_matrix );
        },
        set_origin: function( x, y, z )
        {
            this.local_matrix.setTranslate( x, y, z );
        },
        set_parent:     function(par)
        {
            par.children.push(this);
            this.parent_ = par;

            return true;
        },
        render:         function( gl, xform, view, proj, wf )
        {
            for( var ii = 0; ii < this.children.length; ii++ )
                this.children[ii].render(gl, xform, view, proj, wf );

            var scaled = new Matrix4( this.local_matrix );
            scaled.concat( this.world_matrix );
            scaled.concat( this.scale );
            if( this.draw )
            {
                this.shape.render( gl, scaled, view, proj, wf );
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

    obj.local_matrix.setScale( xs, ys, zs );
    obj.local_matrix.translate( xo, yo, zo );

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
