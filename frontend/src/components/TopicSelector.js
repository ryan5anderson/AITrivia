function TopicSelector() {
  return (
    <div>
      <label htmlFor="topic">Choose a topic: </label>
      <select id="topic" name="topic">
        <option>Science</option>
        <option>History</option>
        <option>Sports</option>
        <option>Pop Culture</option>
      </select>
    </div>
  );
}

export default TopicSelector;
