

function get_cube(points, triangles, faces)
{
    points = new Float32Array
        // x,   y,   z
        ([
         1.0,  1.0,  1.0,   // 0
        -1.0,  1.0,  1.0,   // 1
        -1.0, -1.0,  1.0,   // 2
         1.0, -1.0,  1.0,   // 3
         1.0,  1.0, -1.0,   // 4
        -1.0,  1.0, -1.0,   // 5
        -1.0, -1.0, -1.0,   // 6
         1.0, -1.0, -1.0    // 7
        ]);
    triangles = [
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 7],
        [0, 7, 4],
        [7, 6, 5],
        [7, 5, 4]
    ]
}


function get_skybox()
{
}

//
function get_plane(x_steps, z_steps, x_len, z_len)
{


    var dx = x_len / x_steps;
    var dz = z_len / z_steps;

    var plane = [];
    var z_adg = Math.floor( z_steps / 2);
    var x_adg = Math.floor( z_steps / 2);

    debugger;

    var direction = 1;
    for( var z1 = -z_adg, z2 = 1 - z_adg; z2 < z_adg + z_len; z1 += dz, z2 += dz )
    {
        // Increment loop if direction is positive,
        //decrement loop if direction is negative.
        for( 
                var x = ((direction > 0) ? 0 : x_adg - 1);
                ((direction > 0) ? (x < x_adg + x_len) : (x >= -x_adg));
                x += direction * dx;
           )
        {
            //Vertex coordinate 1.
            plane.push(x * dx);
            plane.push(0);
            plane.push(z1 * dz);

            //Texture coordinate 1.
            plane.push(x * dx);
            plane.push(z1 * dz);

            //Vertex coordinate 2;
            plane.push(x * dx);
            plane.push(0);
            plane.push(z2 * dz);

            //Texture coordinate 2;
            plane.push(x * dx);
            plane.push(z2 * dz);
            direction = direction * -1;
        }
    }

    return new Float32Array(plane);
}
