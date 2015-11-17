


// There's code in here from other source, but I've lost track of which lines
//are from where or by whom, however, it mostly just a line or two here and
//there.  Some is likely form webglfundamentals.org... but I'm no longer even
//sure if anything I used is still in here

//const DEBUG = true;
const DEBUG = false;

const CULL  = false;
const DEPTH = true;

//Standardized key codes:
const UP            =  38;
const DOWN          =  40;
const LEFT          =  37;
const RIGHT         =  39;
const W_CODE        =  87;
const Y_CODE        =  89;
const TILDA_CODE    = 192;
const SHFT_CODE     =  16;
const E_CODE        =  69;
const D_CODE        =  68;
const SPACE_BAR     =  32;
const HELP_CODE     = 191;

//binary key codes, as used for internal state.
const DOWN_ARROW    =    1;
const UP_ARROW      =    2;
const RIGHT_ARROW   =    4;
const LEFT_ARROW    =    8;
const W_KEY         =   16;
const Y_KEY         =   32;
const TILDA_KEY     =   64;
const SHIFT         =  128;
const E_KEY         =  256;
const D_KEY         =  512;
const SPACE         = 1024;
const HELP          = 2048;

//Adjust movement speeds:
const ANGLE_INCREMENT       = 1.5;
const POSITION_INCREMENT    = 0.1;

//Used for indexing into arrays.
const X = 0;
const Y = 1;
const Z = 2;

"use strict";

function main()
{
    // Init stuff...
    var canvas = document.getElementById('render_to');
    var aspect = canvas.clientWidth / canvas.clientHeight;
    var gl = getWebGLContext(canvas);
    if( !gl ) 
    {
        console.log('Could not get WebGL rendering context.');
        return;
    }
    if( DEPTH )
        gl.enable(gl.DEPTH_TEST);
    if( CULL )
    {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    }

    //State associated with keypresses
    var keys =
    {
        code: 0,
        wireframe: false
    }
    camera = get_camera(aspect, [50, 50]);

    // Keypress handling.
    document.onkeydown = function(ev)
    {
        handle_key_down( ev, keys );
    };
    document.onkeyup   = function(ev)
    {
        handle_key_up( ev, keys );
    }

    // Handle browser window resize.
    document.onresize  = function()
    {
        camera.update_projection(aspect);
    };


    var scene_graph = get_scene( init_cube(gl) );
    var windmill    = search_graph("windmill");
    var blades      = search_graph("blades");

    //var skybox = init_skybox(gl);


    var t_shaders = get_terrain_shaders();
    var prog = createProgram( gl, t_shaders.vert, t_shaders.frag );
    var terrain = {
        program: prog,
        svars: {
            a_pos:          set_svar( gl, "a_pos",         prog ),
            a_tex_coord:    set_svar( gl, "a_tex_coord",   prog ),
            u_xform:        set_svar( gl, "u_xform",       prog ),
            u_view:         set_svar( gl, "u_view",        prog ),
            u_perspective:  set_svar( gl, "u_perspective", prog )
        },
        is_loaded: false,
        texture_unit: gl.TEXTURE0,
        buffer: gl.createBuffer()
    };
    var t_texture = new Image();
    t_texture.onload = function(){
        init_terrain( gl, terrain, t_texture );
    };
    // Image from: 
    //http://www.art.eonworks.com/free/textures/floor_tiles_texture_005.png
    //t_texture.src = "./resources/floor_tiles.png";


    // Different textures for debugging.
    //t_texture.src = "./resources/debug.png";
    //t_texture.src = "./resources/cat.jpg";
    t_texture.src = "./resources/debug_2.png";

    //var sky_shaders = get_sky_shaders();

    //REMEMBER TO DELETE THIS LATER
    /*
       var trans = new Matrix4;
       trans.setTranslate( 0, 1, 0 );
       trans.scale( 2, 2, 2 );
       */

    //    gl.clearColor( 0.25, 0.5, 0.75, 1.0 );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    var obj_qty = scene_graph.length;
    var chrono  = Date.now()

    var tick = function()
    {
        gl.clear( gl.COLOR_BUFFER_BIT );
        //render_skybox(gl, sky);
        gl.clear( gl.DEPTH_BUFFER_BIT );

        if( keys.code != 0 );
        key_response( camera, keys, scene_graph );

        chrono = Date.now();
        for( var ii = 0; ii < obj_qty; ii++ )
            scene_graph[ii].update_world();

        for( var ii = 0; ii < obj_qty; ii++ )
            scene_graph[ii].render( gl, new Matrix4,  camera.view, camera.proj, keys.wireframe ); 

        //Render "Terrain" last to show depth buffer functioning.
        render_terrain( gl, terrain, camera.view, camera.proj, keys.wireframe );

        requestAnimationFrame( tick, canvas );
    };

    tick();
}

function handle_key_down( e, keys )
{
    if( DEBUG )
        console.log( e.keyCode + " pressed." );

    switch( e.keyCode )
    {
        case UP:
            keys.code |= UP_ARROW;
            keys.code &= ~DOWN_ARROW;
            break;
        case DOWN:
            keys.code |= DOWN_ARROW;
            keys.code &= ~UP_ARROW;
            break;
        case LEFT: 
            keys.code |= LEFT_ARROW;
            keys.code &= ~RIGHT_ARROW;
            break;
        case RIGHT:
            keys.code |= RIGHT_ARROW;
            keys.code &= ~LEFT_ARROW;
            break;
        case W_CODE: //windmill on/off
            keys.code |= W_KEY;
            break;
        case Y_CODE: //rotate windmill
            keys.code |= Y_KEY;
            break;
        case TILDA_CODE: //toggle wireframe
            keys.code |= TILDA_KEY;
            break;
        case SHFT_CODE: 
            keys.code |= SHIFT;
            break;
        case E_CODE:
            keys.code |= E_KEY;
            break;
        case D_CODE:
            keys.code |= D_KEY;
            break;
        case SPACE_BAR:
            keys.code |= SPACE;
            break;
        case HELP_CODE:
            keys.code |= HELP;
            break;
        default:
            return;
    }
}

function handle_key_up( e, keys )
{
    if( DEBUG )
        console.log( e.keyCode + " released." );

    switch( e.keyCode )
    {
        case UP:
            keys.code &= ~UP_ARROW;
            break;
        case DOWN:
            keys.code &= ~DOWN_ARROW;
            break;
        case LEFT:
            keys.code &= ~LEFT_ARROW;
            break;
        case RIGHT:
            keys.code &= ~RIGHT_ARROW;
            break;
        case Y_CODE:
            keys.code &= ~Y_KEY;
            break;
        case SHFT_CODE:
            keys.code &= ~SHIFT;
            break;
        case E_CODE:
            keys.code &= ~E_KEY;
            break;
        case D_CODE:
            keys.code &= ~D_KEY;
            break;
        default:
            return;
    }
}

function key_response( camera, key, graph )
{
    var mov_dist;
    if( key.code & SHIFT )
    {
        mov_dist = POSITION_INCREMENT;
    }
    else
    {
        mov_dist = POSITION_INCREMENT * 2;
    }


    if( key.code & UP_ARROW )
        camera.move_forward( mov_dist );
    else if( key.code & DOWN_ARROW )
        camera.move_backward( mov_dist );

    if( key.code & LEFT_ARROW )
        camera.rotate_left_by( ANGLE_INCREMENT );
    else if( key.code & RIGHT_ARROW )
        camera.rotate_right_by(ANGLE_INCREMENT );

    if( key.code & E_KEY )
        camera.look_up( ANGLE_INCREMENT );
    else if ( key.code & D_KEY )
        camera.look_down( ANGLE_INCREMENT );

    if( key.code & SPACE )
    {
        camera.reset_up_down();
        key.code &= ~SPACE;
    }

    if( key.code & W_KEY ) //toggle windmill on/off
    {
        key.code &= (~W_KEY); //only do this once.
    }

    if( key.code & Y_KEY ) //rotate windmill
        ;

    if( key.code & TILDA_KEY )
    {
        key.wireframe = !key.wireframe;
        key.code &= ~TILDA_KEY;
    }

    if( key.code & HELP )
    {
        alert(
                "Controls:\n" +
                "   Movement\n" +
                "       [up arrow]\n" +
                "           Move forward.\n" +
                "       [down_arrow]\n" +
                "           Move backwards.\n" +
                "       [e]\n" +
                "           Look up.\n" +
                "       [d]\n" +
                "           Look down.\n\n" +
                "   Windmill\n" +
                "       [w]\n" +
                "           Toggle windmill on/off.\n" +
                "       [y]\n" +
                "           Rotate windmill.\n\n" +
                "   Debug/&c.\n" +
                "       [~] or [`]\n" +
                '           Toggle "wireframe" debug.\n' +
                "       [/] or [?]\n" +
                "           Shows these instructions.\n"
             );
        key.code &= ~HELP;
    }
}
