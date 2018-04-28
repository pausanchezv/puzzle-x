/*********************************************
 * Animated Solver Class Constructor
 *********************************************
 *
 * Developed by: Pau Sanchez
 *
 * website:     pausanchezv.com
 * Github:      github.com/pausanchezv
 * Linkedin:    linkedin.com/in/pausanchezv
 * Twitter:     twitter.com/pausanchezv
 * Facebook:    facebook.com/pausanchezv
 *
 * All rights reserved. - Barcelona 2018 -
 *
 **********************************************
 *
 * An animated solver is needed to see that the A-Star algorithm is working correctly and it is not giving us any wrong action sequence.
 *
 * First of all we need to build the html of the matrix. It is closed under a UL tag, so our squares are constituted through LI tags.
 * Every LI has several data attributes that are gonna help us to build the matrix as fast as possible. However these attributes won't useful to solve the problem since they are accessible through the browser console and it means that any user could hurt the application. And I don't want that! Instead, a closed JS Object is gonna manage the whole process.
 *
 * Things are tight when we have to do the variable change since the start square will have to be the goal square and so on... The easiest way to do that involves refilling the whole matrix because doing that is easier than to have to recompute all distances, all effects, all timers, that's not worth it!
 *
 * The next stage is easy, we just have to use the animate jQuery function to compute the square start effect, and then use its callback to compute the goal square effect.
 *
 * The point is how we will make the effects happen one after another. Easy! We just have to use the async foreach provided by jQuery and set a timer inside it. This is not the unique way, but it works well!
 *
 **********************************************/
function AnimatedSolver(level, actions) {

    // Level to solve
    this.level = level;

    // Actions which will be used to solve the problem
    this.actions = actions;
    this.objectData = {};

    // Rows $ columns
    this.numRows = level[0].length;
    this.numCols = level[0][0].length;
}

/**
 * Animated Solver Class Prototype
 */
AnimatedSolver.prototype = {

    /**
     * HTML Constructor
     */
    buildLevelHTML: function() {

        // Both puzzles start and goal
        var start = this.level[0];
        var goal = this.level[1];

        var html = "";

        // Fill the start puzzle out
        for (var row = 0; row < start.length; row++) {
            for (var col = 0; col < start[0].length; col++) {
                html += '<li data-row="' + row + '" data-col="' + col + '" data-kind="' + start[row][col][0] + '" data-color="' + start[row][col][2] + '" data-scope="' + start[row][col][1] + '"></li>';
                this.objectData[row.toString() + col.toString()] = {};
                this.objectData[row.toString() + col.toString()].kind = start[row][col][0];
                this.objectData[row.toString() + col.toString()].scope = start[row][col][1];
                this.objectData[row.toString() + col.toString()].color = start[row][col][2];
                this.objectData[row.toString() + col.toString()].cssTop = 0;
                this.objectData[row.toString() + col.toString()].cssLeft = 0;
            }
            html += '<div class="clear"></div>';

        }

        // Add html
        $("#left-state").find("> ul").html(html);

        html = "";

        // Fill the goal puzzle out
        for (row = 0; row < goal.length; row++) {
            for (col = 0; col < goal[0].length; col++) {
                html += '<li data-row="' + row + '" data-col="' + col + '" data-color="' + goal[row][col] + '"></li>';
            }
            html += '<div class="clear"></div>';
        }

        // Add html
        $("#right-state").find("> ul").html(html);
    },


    /**
     * Swap both squares start and goal
     *
     * @param row
     * @param col
     * @param newRow
     * @param newCol
     */
    swapSquares: function(row, col, newRow, newCol) {

        // Get start attributes
        var startKind = this.objectData[row.toString() + col.toString()].kind;
        var startColor = this.objectData[row.toString() + col.toString()].color;
        var startScope= this.objectData[row.toString() + col.toString()].scope;

        // Get goal attributes
        var goalKind = this.objectData[newRow.toString() + newCol.toString()].kind;
        var goalColor = this.objectData[newRow.toString() + newCol.toString()].color;
        var goalScope = this.objectData[newRow.toString() + newCol.toString()].scope;

        // Merge the data object
        this.objectData[newRow.toString() + newCol.toString()].kind = startKind;
        this.objectData[newRow.toString() + newCol.toString()].color = startColor;
        this.objectData[newRow.toString() + newCol.toString()].scope = startScope;

        // Merge the data object
        this.objectData[row.toString() + col.toString()].kind = goalKind;
        this.objectData[row.toString() + col.toString()].color = goalColor;
        this.objectData[row.toString() + col.toString()].scope = goalScope;

        // Refill the whole matrix
        var html = "";
        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                var obj = this.objectData[row.toString() + col.toString()];
                html += '<li data-row="' + row + '" data-col="' + col + '" data-kind="' + obj.kind + '" data-color="' + obj.color + '" data-scope="' + obj.scope + '" style="top:0;left:0"></li>';
            }
            html += '<div class="clear"></div>';
        }

        // Add HTML
        $("#left-state").find("> ul").html(html);
    },

    /**
     * Get a square from the DOM
     * @param row
     * @param col
     * @returns {*|{}|jQuery}
     */
    getSquareDOM: function (row, col) {
        return $("#left-state").find("> ul").find("[data-row='" + row + "'][data-col='" + col + "']");
    },

    /**
     * Solve the problem by using an animated way
     */
    animatedSolver: function() {

        // The distance is the size of the square
        var distanceInt = 100;

        // Time effects
        var timeEffectLarge = 370;
        var timeEffectShort = 230;
        var timeIteration = 1200;

        // Instance that is used within the async foreach
        var outerThis = this;

        // Asyn foreach to handle the effects
        $.each(this.actions, function(i, action) {

            // Timeout among effects
            setTimeout(function () {

                // Decrease z-index for all squares
                $("#left-state").find("> ul").find("li").css("z-index", 1);

                // Get both the row and the column
                var row = action.position[0];
                var col = action.position[1];

                // Get the start square from the DOM
                var $square = outerThis.getSquareDOM(row, col);

                // Variables of the goal square
                var $newSquare;
                var newRow = row;
                var newCol = col;

                // Increase z-index from the square that is gonna move
                $square.css('z-index', '100');
                $square.effect("pulsate", 100);

                // Left
                if (action.direction === "left") {

                    newCol = col - action.value;
                    $newSquare = outerThis.getSquareDOM(newRow, newCol);

                    $square.animate({
                        left: - (distanceInt * action.value)
                    }, timeEffectLarge, 'swing', function() {
                        $square.effect( "bounce", timeEffectLarge );
                        $newSquare.animate({
                            left: distanceInt * action.value
                        }, timeEffectShort, 'swing', function() {
                            outerThis.swapSquares(row, col, newRow, newCol);
                        });

                    });

                // Right
                } else if (action.direction === "right") {

                    newCol = col + action.value;
                    $newSquare = outerThis.getSquareDOM(newRow, newCol);

                    $square.animate({
                        left: distanceInt * action.value
                    }, timeEffectLarge, 'swing', function() {
                        $square.effect( "bounce", timeEffectLarge );
                        $newSquare.animate({
                            left: -(distanceInt * action.value)
                        }, timeEffectShort, 'swing', function() {
                            outerThis.swapSquares(row, col, newRow, newCol);
                        });

                    });

                // Up
                } else if (action.direction === "up") {

                    newRow = row - action.value;
                    $newSquare = outerThis.getSquareDOM(newRow, newCol);

                    $square.animate({
                        top: - (distanceInt * action.value)
                    }, timeEffectLarge, 'swing', function() {
                        $square.effect( "bounce", timeEffectLarge );
                        $newSquare.animate({
                            top: distanceInt * action.value
                        }, timeEffectShort, 'swing', function() {

                            outerThis.swapSquares(row, col, newRow, newCol);
                        });

                    });


                // Down
                } else if (action.direction === "down") {

                    newRow = row + action.value;
                    $newSquare = outerThis.getSquareDOM(newRow, newCol);

                    $square.animate({
                        top: distanceInt * action.value
                    }, timeEffectLarge, 'swing', function() {
                        $square.effect( "bounce", timeEffectLarge );
                        $newSquare.animate({
                            top: -(distanceInt * action.value)
                        }, timeEffectShort, 'swing', function() {

                            outerThis.swapSquares(row, col, newRow, newCol);
                        });

                    });

                // Up Left
                } else if (action.direction === "up-left") {

                    newRow = row - action.value;
                    newCol = col - action.value;

                    $newSquare = outerThis.getSquareDOM(newRow, newCol);

                    $square.animate({
                        top: - (distanceInt * action.value),
                        left: - (distanceInt * action.value)
                    }, timeEffectLarge, 'swing', function() {
                        $square.effect( "bounce", timeEffectLarge );
                        $newSquare.animate({
                            top: distanceInt * action.value,
                            left: distanceInt * action.value
                        }, timeEffectShort, 'swing', function() {

                            outerThis.swapSquares(row, col, newRow, newCol);
                        });

                    });

                // Up Right
                } else if (action.direction === "up-right") {

                    newRow = row - action.value;
                    newCol = col + action.value;

                    $newSquare = outerThis.getSquareDOM(newRow, newCol);

                    $square.animate({
                        top: - (distanceInt * action.value),
                        left: distanceInt * action.value
                    }, timeEffectLarge, 'swing', function() {
                        $square.effect( "bounce", timeEffectLarge );
                        $newSquare.animate({
                            top: distanceInt * action.value,
                            left: - (distanceInt * action.value)
                        }, timeEffectShort, 'swing', function() {

                            outerThis.swapSquares(row, col, newRow, newCol);
                        });

                    });

                // Down Right
                } else if (action.direction === "down-right") {

                    newRow = row + action.value;
                    newCol = col + action.value;

                    $newSquare = outerThis.getSquareDOM(newRow, newCol);

                    $square.animate({
                        top: distanceInt * action.value,
                        left: distanceInt * action.value
                    }, timeEffectLarge, 'swing', function() {
                        $square.effect( "bounce", timeEffectLarge );
                        $newSquare.animate({
                            top: - (distanceInt * action.value),
                            left: - (distanceInt * action.value)
                        }, timeEffectShort, 'swing', function() {

                            outerThis.swapSquares(row, col, newRow, newCol);
                        });

                    });

                // Down Left
                } else if (action.direction === "down-left") {
                    newRow = row + action.value;
                    newCol = col - action.value;

                    $newSquare = outerThis.getSquareDOM(newRow, newCol);

                    $square.animate({
                        top: distanceInt * action.value,
                        left: - (distanceInt * action.value)
                    }, timeEffectLarge, 'swing', function() {
                        $square.effect( "bounce", timeEffectLarge );
                        $newSquare.animate({
                            top: - (distanceInt * action.value),
                            left: distanceInt * action.value
                        }, timeEffectShort, 'swing', function() {

                            outerThis.swapSquares(row, col, newRow, newCol);
                        });

                    });
                }

            }, timeIteration + i * timeIteration);
        });
    }
};