/* ============================================================================
  Axis-Aligned Bounding Box (AABB) Collision Helper
  - Detects intersection between two rectangular bounding boxes
  - Used for simple and fast collision detection
============================================================================ */

/* ============================================================================
  aabb
  - Parameters:
      a: first rectangle { x, y, w, h }
      b: second rectangle { x, y, w, h }
  - Returns:
      true  → rectangles overlap
      false → rectangles do not overlap
============================================================================ */

export function aabb(a, b) {
  /* ------------------------------------------------------------------------
    Collision condition
    - Horizontal overlap:
        a.left  < b.right
        a.right > b.left
    - Vertical overlap:
        a.top    < b.bottom
        a.bottom > b.top
    - All conditions must be true for intersection
  ------------------------------------------------------------------------ */

  return (
    /* Horizontal overlap */
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    /* Vertical overlap */
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
