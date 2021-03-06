

/** Generates and returns a single instance of an indexed cube, the coodinates
 * are from an example from the course textbook, but scaled to generate a base
 * cube whose dimensions measure 1x1x1 unit located with the origin at its
 * centroid.
 *
 * @param The monolithic WebGL object.
 */
function init_cube( gl )
{
    var shaders = get_cube_shaders();
    var prog = createProgram( gl, shaders.vert, shaders.frag );

    var cube = 
    {
        program: prog,
        svars: {
            u_xform:       set_svar( gl, "u_xform",       prog ),
            u_view:        set_svar( gl, "u_view",        prog ),
            u_perspective: set_svar( gl, "u_perspective", prog )
        },
        indicies: new Uint8Array
            ([
             // front
             0, 1, 2,   0, 2, 3,
             // right
             4, 5, 6,   4, 6, 7,
             // up
             8, 9,10,   8,10,11,
             // left
             12,13,14,  12,14,15,
             // down
             16,17,18,  16,18,19,
             // back
             20,21,22,  20,22,23
             ]),
        /**
         * Renders one instance of the cube.
         * @param gl, The monolithic WebGL object.
         * @param xform, The transformation matrix of the instance of the cube
         * being rendered.
         * @param view, The view matrix.
         * @param proj, The projection matrix.
         * @param wf,   bool, if, or not, the cube should be rendered as a
         * wireframe.
         */
        render: function(gl, xform, view, proj, wf )
        {
            gl.useProgram(this.program);

            gl.uniformMatrix4fv(this.svars.u_xform,       false, xform.elements);
            gl.uniformMatrix4fv(this.svars.u_view,        false,  view.elements);
            gl.uniformMatrix4fv(this.svars.u_perspective, false,  proj.elements);

            gl.bindBuffer( gl.ARRAY_BUFFER, this.vertex_buffer );
            gl.vertexAttribPointer( 
                    this.svars.a_pos,
                    3,
                    gl.FLOAT,
                    false,
                    0, 0 );
            gl.bindBuffer( gl.ARRAY_BUFFER, this.color_buffer );
            gl.vertexAttribPointer(
                    this.svars.a_color,
                    3,
                    gl.FLOAT,
                    false,
                    0, 0 );

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.i_buffer );
            if( !wf )
                gl.drawElements(gl.TRIANGLES, this.indicies.length, gl.UNSIGNED_BYTE, 0);
            else
                gl.drawElements(gl.LINE_LOOP, this.indicies.length, gl.UNSIGNED_BYTE, 0);
        },
        //Create buffer object
        i_buffer: gl.createBuffer(),
        vertex_buffer: gl.createBuffer(),
        color_buffer: gl.createBuffer()
    }
    if( !cube.i_buffer )
        throw "Could not create cube index buffer.";
    if( !cube.vertex_buffer )
        throw "Could not create cube vertex buffer.";
    if( !cube.color_buffer )
        throw "Could not create cube color buffer.";


    var verticies = new Float32Array
        ([
         // v0-v1-v2-v3 front
         0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5,
         // v0-v3-v4-v5 right
         0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5,
         // v0-v5-v6-v1 up
         0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5,  
         // v1-v6-v7-v2 left
         -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,  
         // v7-v4-v3-v2 down
         -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, 
         // v4-v7-v6-v5 back
         0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5   
        ]);
    var colors = new Float32Array
        ([
         // v0-v1-v2-v3 front(blue)
         0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  
         // v0-v3-v4-v5 right(green)
         0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,
         // v0-v5-v6-v1 up(red)
         1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,
         // v1-v6-v7-v2 left
         1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,
         // v7-v4-v3-v2 down
         1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
         // v4-v7-v6-v5 back
         0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0
        ]);

    cube.svars.a_pos   = create_array_buffer( 
            gl, 
            verticies,
            3,
            gl.FLOAT,
            "a_pos",
            prog,
            cube.vertex_buffer );
    cube.svars.a_color = create_array_buffer(
            gl,
            colors,
            3,
            gl.FLOAT,
            "a_color",
            prog,
            cube.color_buffer );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.i_buffer );
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indicies, gl.STATIC_DRAW );

    return cube;
}

/**
 * Creates a new buffer for the data to be passed to the GPU and returns a
 * handle to the buffer's location.
 * @param gl, The monolithic WebGL object.
 * @param data, The data to be loaded to the GPU.
 * @param qty, The number of entries in the data array to be loaded into the
 * GPU.
 * @param type, The data-type of the data to be loaded to the GPU.  Must be one
 * of the gl.* types, i.e.: gl.FLOAT
 * @param attrib, The name of the appropriate attribute variable from the
 * shader program.
 * @param prog, The shader program to link to, this must be provided because
 * of the asynchronous loading of various data.
 * @param buffer, The buffer to send the data to.
 */
function create_array_buffer( gl, data, qty, type, attrib, prog, buffer )
{
    gl.useProgram(prog);

    if( !buffer )
    {
        console.log(" Couldn't create VBO for " + attrib );
    }
    else
        console.log("@@ SUCCESS: VBO for '" + attrib + ",' created." );

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer );
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW );

    var assign = gl.getAttribLocation( prog, attrib );
    if( assign < 0 )
    {
        console.log( " Failed to get location of " + attrib );
    }
    else
        console.log( "@@ SUCCESS: location of '" + attrib + ",' acquired." );

    gl.vertexAttribPointer( assign, qty, type, false, 0, 0 );
    gl.enableVertexAttribArray( assign );

    return assign;
}
