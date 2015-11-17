

/**
 * Get location of an individual shader var.
 */
function set_svar( gl, varname, prog )
{
    //    gl.useProgram( prog );

    var vars = -1;

    switch( varname[0] ) // "Standardized" naming conventions must be used 
    {                    //for this to work.
        case 'u':
            //fallthrough
        case 'U':
            vars = gl.getUniformLocation(prog, varname);
            break;
        case 'a':
            //fallthrough
        case 'A':
            vars = gl.getAttribLocation(prog, varname);
            break;
        default:
            vars = -1;
    }

    if( vars < 0 )
    {
        console.log("Failed to find '" + varname + ".'")
    }
    else
    {
        if( vars !== null )
        {
            console.log("@@ SUCCESS: " + varname + " found.");
        }
        else
        {
            console.log( "%% " + varname + " is null, may have been " +
                    "removed during compile." );
        }
    }
    return vars;
}
