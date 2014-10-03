from datetime import timedelta
# Custom function to replace a list of keys with its values.

def rename_col_or_index(original_list, dictionary):
    
    new_list = []
    
    for item in original_list:
        new_list.append(dictionary[item])
        
    return new_list

# 12 September 2014:
# A modification that we would like to do is as follows:
# - Find the earliest isolate in each subgraph.
# - Find the source for each of these earliest isolates in each subgraph.

# Here, I write custom functions to get that done.


# Function for finding earliest isolate in each subgraph:
def find_earliest_nodes(query_subgraph):
    """
    Returns isolate(s) that have a date equal to the earliest date amongst all of the 
    isolates in the subgraph.
    
    NOTE: If there are multiple isolates that fulfill the criteria, all of them are considered.
    """
    
    subgraph_nodes = query_subgraph.nodes(data=True)
    
    dates = [node[1]['isolation_date'] for node in subgraph_nodes]
    
    min_date = min(dates)
    
    earliest_nodes = []
   
    for node in subgraph_nodes:
        if node[1]['isolation_date'] == min_date:
            earliest_nodes.append(node)
            
    return earliest_nodes
            
# Function for adding back the edge for a given earliest_node.
def find_source_node(query_node, discarded_edges_graph):
    """
    Basic idea of logic:
    1. In discarded_edges_graph, identify in_edges if source node's isolation_date < sink node's isolation_date 
       by more than 6 days.
    2. Identify edge(s) of max weight.
    3. Add it to a list of edges to be added back into the graph.
    
    NOTES:
    - node has to have have metadata provided as well. Otherwise, the code doesn't work. 
    """
    in_edges = [edge for edge in discarded_edges_graph.in_edges(query_node[0], data=True) if edge[2]['time_delta'] > timedelta(6)]
    edges_to_add = []
    if len(in_edges) > 0:
        maxweight = max([edge[2]['weight'] for edge in in_edges]) 
        for edge in in_edges:
            source = edge[0]
            sink = edge[1]
            data = edge[2]
            # Diagnostics only
            # if query_node[0] == 'A/mallard/Interior Alaska/10BM08884R0/2010':
                # print(in_edges)
                # print(maxweight)
            if edge[2]['weight'] == maxweight:
                edges_to_add.append((source, sink, data))
                
    return edges_to_add


# Custom function to convert serialized datetime back into date object for comparison

def to_datetime(datestring):
    from datetime import date
    """
    e.g. '2010-08-12T00:00:00' --> date(2010, 08, 12)
    """
    
    y = int(datestring.split('-')[0])
    m = int(datestring.split('-')[1])
    d = int(datestring.split('-')[2].split('T')[0])
    
    return date(y,m,d)


# This is a custom function for serializing dates such that it is JSON compatible. 
# It gets used right at the last step prior to the JSON dump.
from dateutil.tz import tzutc

UTC = tzutc()

def serialize_date(dt):
    """
    Serialize a date/time value into an ISO8601 text representation
    adjusted (if needed) to UTC timezone.

    For instance:
    >>> serialize_date(datetime(2012, 4, 10, 22, 38, 20, 604391))
    '2012-04-10T22:38:20.604391Z'
    """
    #if dt.tzinfo:
    #    dt = dt.astimezone(UTC)
    return dt.isoformat()