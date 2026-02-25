import Int "mo:core/Int";

actor {
  public query ({ caller }) func add(x : Int, y : Int) : async Int {
    x + y;
  };

  public query ({ caller }) func subtract(x : Int, y : Int) : async Int {
    x - y;
  };

  public query ({ caller }) func multiply(x : Int, y : Int) : async Int {
    x * y;
  };

  public query ({ caller }) func divide(x : Int, y : Int) : async ?Int {
    if (y == 0) {
      null;
    } else {
      ?(x / y);
    };
  };
};
