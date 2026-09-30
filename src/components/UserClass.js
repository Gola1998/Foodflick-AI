import React from "react";

class UserClass extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);

    this.state = {
      count: 0,
      count2: 2,
    };
    console.log(this.props.name + "Child Constructor");
  }

  componentDidMount(){
    console.log(this.props.name + "Child Component Did Mount");
  }

  render() {
    console.log(this.props.name + "Child Render");
    return (
      <div className="user-card">
        <h1>Count: {this.state.count}</h1>
        <button
          onClick={() => {
            this.setState({
              count: this.state.count + 1,
            });
          }}
        >
          Count Increase
        </button>
        <h1>Count2: {this.state.count2}</h1>
        <h2>Name: {this.props.name}</h2>
        <h3>Location: {this.props.location}</h3>
        <h4>Contact: @gaurav</h4>
      </div>
    );
  }
}

export default UserClass;
