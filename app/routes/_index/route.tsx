import type { LoaderFunctionArgs } from "react-router";


import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return null;
};

export default function App() {
  

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>A short heading about [your app]</h1>
        <p className={styles.text}>
          A tagline about [your app] that describes your value proposition.
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
        </ul>
      </div>
      <span className="heading">User Rating</span>
<span className="fa fa-star checked"></span>
<span className="fa fa-star checked"></span>
<span className="fa fa-star checked"></span>
<span className="fa fa-star checked"></span>
<span className="fa fa-star"></span>
<p>4.1 average based on 254 reviews.</p>

<div className="row">
  <div className="side">
    <div>5 star</div>
  </div>
  <div className="middle">
    <div className="bar-container">
      <div className="bar-5"></div>
    </div>
  </div>
  <div className="side right">
    <div>150</div>
  </div>
  <div className="side">
    <div>4 star</div>
  </div>
  <div className="middle">
    <div className="bar-container">
      <div className="bar-4"></div>
    </div>
  </div>
  <div className="side right">
    <div>63</div>
  </div>
  <div className="side">
    <div>3 star</div>
  </div>
  <div className="middle">
    <div className="bar-container">
      <div className="bar-3"></div>
    </div>
  </div>
  <div className="side right">
    <div>15</div>
  </div>
  <div className="side">
    <div>2 star</div>
  </div>
  <div className="middle">
    <div className="bar-container">
      <div className="bar-2"></div>
    </div>
  </div>
  <div className="side right">
    <div>6</div>
  </div>
  <div className="side">
    <div>1 star</div>
  </div>
  <div className="middle">
    <div className="bar-container">
      <div className="bar-1"></div>
    </div>
  </div>
  <div className="side right">
    <div>20</div>
  </div>
</div>

    </div>
  );
}
