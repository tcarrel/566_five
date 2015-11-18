/**
 * Thomas R. Carrel
 * @file object.js
 */

/** All functions in this file return an object containing both necessary
 * shader programs.
 */
function get_terrain_shaders()
{
    return {
        vert:
            'attribute  vec4    a_pos;\n' +
            'uniform    mat4    u_xform;\n' +
            'uniform    mat4    u_view;\n' +
            'uniform    mat4    u_perspective;\n' +
            'attribute  vec2    a_tex_coord;\n' +
            'varying    vec2    v_tex_coord;\n' +

            'void main()\n' +
            '{\n' +
            '    gl_Position = u_perspective * u_view * u_xform * a_pos;\n' +
            '    v_tex_coord = a_tex_coord;\n' +
            '}\n',
        frag:
            'precision  mediump     float;\n' +

            'uniform    sampler2D   u_sampler;\n' +
            'varying    vec2        v_tex_coord;\n' +

            'void main()\n' +
            '{\n' +
            '   gl_FragColor = texture2D(u_sampler, v_tex_coord);\n'+
            '}\n'
    };
}

function get_cube_shaders()
{
    return{
        vert:
            'attribute  vec4    a_pos;\n' +
            'attribute  vec4    a_color;\n' +
            'uniform    mat4    u_xform;\n' +
            'uniform    mat4    u_view;\n' +
            'uniform    mat4    u_perspective;\n' +

            'varying    vec4    v_color;\n' +

            'void main()\n' +
            '{\n' +
            '    gl_Position = u_perspective * u_view * u_xform * a_pos;\n' +
            '    v_color = a_color;\n' +
            '}\n',
        frag:
            'precision  mediump     float;\n' +

            'varying    vec4        v_color;\n' +

            'void main()\n' +
            '{\n' +
            '   gl_FragColor = v_color;\n'+
            '}\n'
    };
}
