
/** Builds and returns a single quad that can later be oriented and scaled as
 * necessary.
function build_quad( width, length, w_offset, l_offset )
{
    var quad = [];
    /* (-,-)3   (-,+)0
           *----*              *---->  (width)
           | __/|              |
           |/   |              |(length)
           *----*              V
       (+,-)1   (+,+)2
     */

    // (-,-)
    quad.push( [ (l_offset - (length/2) ), ( w_offset + (width/2) ) ] );
    // (-,+)
    quad.push( [ (l_offset + (length/2) ), ( w_offset - (width/2) ) ] );
    // (+,+)
    quad.push( [ (l_offset + (length/2) ), ( w_offset + (width/2) ) ] );
    // (+,-)
    quad.push( [ (l_offset - (length/2) ), ( w_offset - (width/2) ) ] );


    return quad;
}

/** Creates and single panel of the plane.
 */
function init_terrain( gl, T, image )
{

    gl.useProgram( T.program );

    //Load Image.
    var quad = build_quad( 100, 100, 0, 0 );
    T.shape = new Float32Array([
            quad[0][0], 0, quad[0][1], 0.0, 0.0,
            quad[1][0], 0, quad[1][1], 20.0,20.0,
            quad[3][0], 0, quad[3][1], 0.0, 20.0,
            quad[0][0], 0, quad[0][1], 0.0, 0.0,
            quad[2][0], 0, quad[2][1], 20.0, 0.0,
            quad[1][0], 0, quad[1][1], 20.0, 20.0
           ] 
            );
    T.ppv = 5; //Points Per Vertex

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture( T.texture_unit );
    T.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, T.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image );
    gl.generateMipmap(gl.TEXTURE_2D);
    console.log("Terrain texture, loaded.");

    //Load verticies.
    if( !T.buffer )
    {
        T.buffer = gl.createBuffer(); //second attempt, just in case
    }

    if( !T.buffer )
    {
        console.log("Failed to create terrain buffer.");
    }
    else
    {
        console.log("Terrain buffer was created successfully.");
    }

    var FSIZE = T.shape.BYTES_PER_ELEMENT;
    gl.bindBuffer( gl.ARRAY_BUFFER, T.buffer );
    gl.bufferData( gl.ARRAY_BUFFER, T.shape, gl.STATIC_DRAW );
    gl.vertexAttribPointer(
            T.svars.a_pos,
            3,
            gl.FLOAT,
            false,
            5 * FSIZE,
            0 );
    gl.enableVertexAttribArray( T.svars.a_pos );
    gl.vertexAttribPointer(
            T.svars.a_tex_coord,
            2,
            gl.FLOAT,
            false,
            5 * FSIZE,
            3 * FSIZE);
    gl.enableVertexAttribArray( T.svars.a_tex_coord );
    T.model_mat = new Matrix4();
    T.model_mat.setIdentity();

    T.is_loaded = true;
}

/** Render all terrain that has been loaded.
 * @param gl, The monolithic WebGL object.
 * @param T, a transformation matrix for the parent of this node.
 */
function render_terrain( gl, T, at, pers, wf )
{
    if( !T.is_loaded )
        return;

    gl.useProgram( T.program );

    var FSIZE = T.shape.BYTES_PER_ELEMENT;

    gl.bindTexture( gl.TEXTURE_2D, T.texture );
    gl.uniform1i( T.svars.u_sampler, T.texture_unit );

    gl.uniformMatrix4fv(
            T.svars.u_xform,
            false,
            T.model_mat.elements );
    gl.uniformMatrix4fv(
            T.svars.u_view,
            false,
            at.elements );
    gl.uniformMatrix4fv(
            T.svars.u_perspective,
            false,
            pers.elements );
    gl.bindBuffer(
            gl.ARRAY_BUFFER,
            T.buffer );
    gl.vertexAttribPointer(
            T.svars.a_pos,
            3,
            gl.FLOAT,
            false,
            5 * FSIZE,
            0 );
    gl.vertexAttribPointer(
            T.svars.a_tex_coord,
            2,
            gl.FLOAT,
            false,
            5 * FSIZE,
            3 * FSIZE );
    if( !wf )
        gl.drawArrays(
                gl.TRIANGLES,
                0,
                T.shape.length / T.ppv );
    else
        gl.drawArrays(
                gl.LINE_LOOP,
                0,
                T.shape.length / T.ppv );
}

