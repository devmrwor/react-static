import React from 'react'
import { withRouteData } from 'react-static'
import { Link } from '@reach/router'
//

export default withRouteData(({ post, previousPost, nextPost }) => (
  <div>
    <Link to="/blog/">{'<'} Back</Link>
    <br />
    <h3>{post.title}</h3>
    <p>{post.body}</p>
    {previousPost.title === '' ? (
      ''
    ) : (
      <Link to={previousPost.path}>
        <button>{previousPost.title}</button>
      </Link>
    )}

    {nextPost.title === '' ? (
      ''
    ) : (
      <Link to={nextPost.path}>
        <button>{nextPost.title}</button>
      </Link>
    )}
  </div>
))
